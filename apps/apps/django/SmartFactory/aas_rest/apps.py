import datetime

from django.apps import AppConfig

import influxdb_client
import time

from asyncua import ua, Client
from asyncua.crypto import security_policies
from asyncua.crypto.uacrypto import CertProperties
import sys, traceback
import time


from asgiref.sync import async_to_sync

import os
import json

import logging
logger = logging.getLogger('app')


CERT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + os.path.sep + 'certs'

INFLUX_URL = 'http://localhost:8086'
INFLUX_TOKEN = os.environ['TSDB_TOKEN']
INFLUX_ORG = os.environ['TSDB_ORG']
INFLUX_BUCKET = os.environ['TSDB_BUCKET']

class AasRestConfig(AppConfig):
    name = 'aas_rest'


@async_to_sync
async def editOPCUA(data):
    response = {'code': -1, 'message':'Failure'}
    try:
        print(CERT_ROOT)
        jData = json.loads(data);
        tag = jData['tag']
        value = jData['value']
        print(type(tag), type(value))
        client = Client(url='opc.tcp://1.214.117.235:4184', timeout=60)
        client.application_uri = 'urn:open62541.server.application'

        ua.DataValue

        client.set_user(os.environ['OPCUA_USER'])
        client.set_password(os.environ['OPCUA_PWD'])
        security_policy = security_policies.SecurityPolicyBasic256Sha256
        user_key = CertProperties(CERT_ROOT + os.path.sep + "opcua_key.der", "DER")
        user_cert = CertProperties(CERT_ROOT + os.path.sep + "opcua_cert.der", "DER")
        security_mode = ua.MessageSecurityMode.SignAndEncrypt
        client.secure_channel_timeout = 10000
        client.session_timeout = 10000
        await client.set_security(security_policy, user_cert, user_key, mode=security_mode)

        await client.connect()

        #objects = client.nodes.objects
        #print(objects)
        #v = await objects.add_variable(3, 'MyROVariable', 6)

        ro = client.get_node(tag)
        await ro.write_value(value, varianttype=type(value))
        print(await ro.read_value())
        await client.disconnect()
        #res = await ro.read_value()
        #print(res)

        #async with Client(url='opc.tcp://localhost:4840/freeopcua/server/') as client:
        #    while True:
        #        client.write_values(tag, value)
        #        client.disconnect()

        response['code'] = 1
        response['message'] = 'Success'
    except Exception:
        traceback.print_exc()
        response['code'] = -1
        response['message'] = 'Failure'
    return response


def getMeta(data):
    response = {'code': -1, 'message': 'Failure', 'data': []}
    try:
        client = influxdb_client.InfluxDBClient(
            url=INFLUX_URL,
            token=INFLUX_TOKEN,
            org=INFLUX_ORG)

        query = 'import "influxdata/influxdb/schema"' \
                'schema.fieldKeys(bucket: "'+INFLUX_BUCKET+'")'

        query_api = client.query_api()
        result = query_api.query(org=INFLUX_ORG, query=query)

        for table in result:
            for record in table.records:
                response['data'].append({'NAME': record.get_value()})

        response['code'] = 1
        response['message'] = 'Success'
    except Exception:
        traceback.print_exc()
        response['code'] = -1
    return response

def getTag(data):
    response = {'code': -1, 'message':'Failure', 'data':[]}
    tag = data.get('tag', None)
    fr = data.get('from', None)
    to = data.get('to', None)
    lst = data.get('last', None)

    try:
        if tag is None:
            response['code'] = -2
            return response
            response['message'] = 'None Tag'
        elif (fr is None and to is None) and lst is None:
            response['code'] = -3
            response['message'] = 'None Date And Last'
            return response

        client = influxdb_client.InfluxDBClient(
            url=INFLUX_URL,
            token=INFLUX_TOKEN,
            org=INFLUX_ORG)

        query = ' from(bucket:"'+INFLUX_BUCKET+'")'
        if lst is not None:
            query += ' |> range(start: 0)'
            query += ' |> filter(fn: (r) => r["_measurement"] == "mos" and r["_field"] == "'+tag+'")'
            query += ' |> group(columns: ["_field"])'
            query += ' |> last(column: "_time")'

            query_api = client.query_api()
            result = query_api.query(org=INFLUX_ORG, query=query)

            for table in result:
                for record in table.records:
                    response['data'].append({'NAME':record.get_field(), 'TIME':time.strftime('%Y-%m-%d %H:%M:%S', record.get_time().timetuple()), 'VALUE':record.get_value()})

            20220303141300
            response['code'] = 1
            response['message'] = 'Success'
        elif fr is not None and to is not None:
            frTime = None
            toTime = None
            if len(fr) == 14:
                frTime = datetime.datetime.strptime(fr, '%Y%m%d%H%M%S').strftime('%Y-%m-%dT%H:%M:%S.0')
                #frTime = time.strftime('%Y-%m-%dT%H:%M:%S.0',time.gmtime(time.mktime(datetime.datetime.strptime(fr, '%Y%m%d%H%M%S').timetuple())))
            elif len(fr) == 20:
                frTime = datetime.datetime.strptime(fr, '%Y%m%d%H%M%S%f').strftime('%Y-%m-%dT%H:%M:%S.%f')
                #frTime = time.strftime('%Y-%m-%dT%H:%M:%S.%f',time.gmtime(time.mktime(datetime.datetime.strptime(fr, '%Y%m%d%H%M%S%f').timetuple())))
            if len(to) == 14:
                toTime = datetime.datetime.strptime(to, '%Y%m%d%H%M%S').strftime('%Y-%m-%dT%H:%M:%S.0')
                #toTime = time.strftime('%Y-%m-%dT%H:%M:%S.0',time.gmtime(time.mktime(datetime.datetime.strptime(to, '%Y%m%d%H%M%S').timetuple())))
            elif len(to) == 20:
                toTime = datetime.datetime.strptime(to, '%Y%m%d%H%M%S%f').strftime('%Y-%m-%dT%H:%M:%S.%f')
                #toTime = time.strftime('%Y-%m-%dT%H:%M:%S.%f',time.gmtime(time.mktime(datetime.datetime.strptime(to, '%Y%m%d%H%M%S%f').timetuple())))
            query += ' |> range(start: '+frTime+'Z, stop: '+toTime+'Z)'
            query += ' |> filter(fn: (r) => r["_measurement"] == "'+INFLUX_BUCKET+'" and r["_field"] == "'+tag+'")'
            query_api = client.query_api()
            result = query_api.query(org=INFLUX_ORG, query=query)

            for table in result:
                for record in table.records:
                    response['data'].append({'name':record.get_field(), 'time':time.strftime('%Y-%m-%d %H:%M:%S.%f', record.get_time().timetuple()), 'value':record.get_value()})

            response['code'] = 1
            response['message'] = 'Success'
    except Exception:
        traceback.print_exc()
        response['code'] = -1
    return response




