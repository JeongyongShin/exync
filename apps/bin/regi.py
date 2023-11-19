#!/usr/bin/env python

import pika
import uuid
import json

connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost',
                 credentials=pika.PlainCredentials(username='shinwoo1', password='shinwoo1')))

channel = connection.channel()
channel.exchange_declare(exchange='aasEvent', exchange_type='topic')
result = channel.queue_declare(queue='', exclusive=True)
queue_name = result.method.queue
channel.queue_bind(exchange='aasEvent', queue=queue_name, routing_key='cloud.event')

class RpcClient(object):
    def __init__(self):
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost',
                              credentials=pika.PlainCredentials(username='shinwoo1', password='shinwoo1')))
        self.channel = self.connection.channel()
        result = self.channel.queue_declare(queue='', exclusive=True)
        self.callback_queue = result.method.queue

        self.channel.basic_consume(
            queue=self.callback_queue,
            on_message_callback=self.on_response,
            auto_ack=True)

    def on_response(self, ch, method, props, body):
        # print(body)
        if self.corr_id == props.correlation_id:
            self.response = body

    def call(self, cmd, gw):
        self.response = None
        self.corr_id = str(uuid.uuid4())
        route = 'cloud.command.%s' % gw
        # print(route)
        self.channel.basic_publish(
                exchange='aasCommand',
                routing_key=route,
                properties=pika.BasicProperties(
                    reply_to=self.callback_queue,
                    correlation_id=self.corr_id,
                ),
                body=cmd)

        self.connection.process_data_events(time_limit=1)
        return self.response

    def disconnect(self):
        self.connection.close()

def on_request(ch, method, props, body):
    # print('request=')
    if props.reply_to == None:
        return

    response = {}

    regi_info = json.loads(body)
    # print(regi_info)
    if 'event' not in regi_info:
        response['code'] = '100'
        response['message'] = 'failure'

        # print(props.reply_to)
        # print(props.correlation_id)
        ch.basic_publish(exchange='',
                         routing_key=props.reply_to,
                         properties=pika.BasicProperties(correlation_id = props.correlation_id),
                         body=json.dumps(response))
        # ch.basic_ack(delivery_tag=method.delivery_tag)
        return

    if regi_info['event'] == 'gatewayRegi':
        args = regi_info['arg']

        response['code'] = '100'
        response['message'] = 'fail'

        gather_info = {}
        aas_list = []
        with open('/opt/cfg/gather.json') as json_file:
            gather_info = json.load(json_file)

        if 'OPCUA_LIST' in gather_info:
            gather_list = gather_info['OPCUA_LIST']

            for gather in gather_list:
                if args[0] == gather['NAME'] and args[1] == gather['KEY']:
                    aas_list = gather['AAS_LIST']
                    response['code'] = '200'
                    response['message'] = 'success'
                    break

        ch.basic_publish(exchange='',
                         routing_key=props.reply_to,
                         properties=pika.BasicProperties(correlation_id = props.correlation_id),
                         body=json.dumps(response))
        # ch.basic_ack(delivery_tag=method.delivery_tag)

        cmd = {}
        cmd['src'] = 'cloud'
        cmd['dst'] = regi_info['src']
        cmd['cmd'] = 'getFile'
        cmd['arg'] = []

        for aas in aas_list:
            cmd['arg'].append(aas)
        # print(json.dumps(cmd))

        try:
            for i in range(3):
                rpc = RpcClient()
                response = rpc.call(json.dumps(cmd), regi_info['src'])
                # print(" [.] Got %r" % response)
                rpc.disconnect()

                if response != None:
                    break;
        except:
            rpc.disconnect()

    elif regi_info['event'] == 'serverReady':
        response['code'] = '200'
        response['message'] = 'success'

        ch.basic_publish(exchange='',
                         routing_key=props.reply_to,
                         properties=pika.BasicProperties(correlation_id = props.correlation_id),
                         body=json.dumps(response))
        # ch.basic_ack(delivery_tag=method.delivery_tag)

    else:
        response['code'] = '100'
        response['message'] = 'failure'

        ch.basic_publish(exchange='',
                         routing_key=props.reply_to,
                         properties=pika.BasicProperties(correlation_id = props.correlation_id),
                         body=json.dumps(response))
        # ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue=queue_name, on_message_callback=on_request, auto_ack=True)


# print(" [x] Awaiting RPC requests")
channel.start_consuming()
