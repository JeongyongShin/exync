import json
import threading
import paho.mqtt.client as mqtt

from common.logger import Logger

class MqttHandler:
    'MqttHandler Class'

    # level : 0=NOTSET, 10=DEBUG, 20=INFO, 30=WARNING, 40=ERROR, 50=CRITICAL
    LOGGER = Logger('MqttHandler', level=20)
    
    '''
    '''
    def __init__(self, host, port):
        self.logger = MqttHandler.LOGGER

        self.host = host
        self.port = port


        self.client = None

        # 새로운 클라이언트 생성
        self.client = mqtt.Client()

        # 콜백 함수 설정 on_connect(브로커에 접속), on_disconnect(브로커에 접속중료), on_subscribe(topic 구독),
        # on_message(발행된 메세지가 들어왔을 때)
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_subscribe = self.on_subscribe
        self.client.on_message = self.on_message

        self.comsume_thread = None
        self.topic_hdl_map = {}


        # Extra Clients
        self.clients_ext_cnt = 0;
        self.clients_ext = []

    '''
    '''
    def __del__(self):
        self.logger.log("__del__:" + self.__class__.__name__)


    '''
    '''
    def isOK(self):
        if self.comsume_thread == None:
            return False
        else:
            return True



    '''
    '''
    def on_connect(self, client, userdata, flags, rc):
        if rc != 0:
            self.logger.ERR("on_connect; rc=", rc)
            return
        
        self.logger.INF("on_connect OK")

        for key in self.topic_hdl_map.keys():
            self.logger.INF("subscribing topic:" + key)
            self.client.subscribe(key)


    def on_disconnect(self, client, userdata, flags, rc=0):
        self.logger.INF("on_disconnect")


    def on_subscribe(self, client, userdata, mid, granted_qos):
        self.logger.INF("on_subscribe: " + str(mid) + " " + str(granted_qos))

    def on_message(self, client, userdata, message):
        self.logger.INF("on_message topic=" + message.topic)

        self.topic_hdl_map[message.topic](message.topic,message.payload)



    def set_topic_handler(self, topic, topic_handler):
        self.topic_hdl_map[topic] = topic_handler


    def start_consume(self):
        if self.client == None:
            return

        self.comsume_thread = threading.Thread(target=self.client.loop_forever)
        self.comsume_thread.start()

        try:
            self.client.connect(self.host, self.port)
        except:
            self.logger.ERR("Connection Fialed; broker=" + self.host)
            return None

        self.logger.INF("loop_forever OK")

 
    def stop_consume(self):
        if self.client == None:
            return
        self.client.loop_stop()     


    def publish(self, topic, payload):
        self.publish_on_client(self.client, topic, payload)


    def publish_on_client(self, client, topic, payload):
        if client == None:
            return

        self.logger.INF("publish; " + topic + ":" + payload)
        client.publish(topic, payload)




    def on_connect_ext(self, client, userdata, flags, rc):
        if rc != 0:
            self.logger.ERR("on_connect_ext; rc=" + rc)
            return

        self.logger.INF("on_connect_ext OK")
    
        for cli_idx in range(self.clients_ext_cnt):
            cli_ext = self.clients_ext[cli_idx]
            if  cli_ext["client"] == client:
                self.logger.INF("subscribing topic:" + cli_ext["topic"])
                client.subscribe(cli_ext["topic"])



    def start_new_client_for(self, topic, msg_handler):

        new_client = mqtt.Client(str(self.clients_ext_cnt)) 
      
        new_client.on_connect = self.on_connect_ext
        new_client.on_disconnect = self.on_disconnect
        new_client.on_subscribe = self.on_subscribe
        new_client.on_message = msg_handler

        comsume_thread = threading.Thread(target=new_client.loop_forever)
        comsume_thread.start()

        try:
            new_client.connect(self.host, self.port, 60)
        except:
            self.logger.ERR("Connection Fialed; broker=" + self.host)
            return None

        self.logger.INF("loop_forever OK; on topic:" + topic)

        cli_ext = {}
        cli_ext["client"] = new_client
        cli_ext["topic"] = topic
        cli_ext["msg_handler"] = msg_handler
        cli_ext["looper"] = comsume_thread
        self.clients_ext.append(cli_ext)

        self.clients_ext_cnt += 1

        return new_client



