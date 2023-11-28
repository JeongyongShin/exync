from flask import Flask, render_template, url_for, request, redirect, json, jsonify, make_response, session, flash
#from werkzeug import secure_filename
from werkzeug.utils import secure_filename
import os
import time

from flask_bootstrap import Bootstrap
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from flask import Flask, Response

from threading import Thread, Event
import threading

from common.logger import Logger

from datetime import timedelta


class EndpointAction(object):

    def __init__(self, action):
        self.action = action
        self.response = Response(status=200, headers={})

    def __call__(self, *args):
        '''
        self.action()
        return self.response
        '''
        return self.action()



class FlaskAppWrapper:
    'FlaskAppWrapper Class'
    '''
    '''
    # level : 0=NOTSET, 10=DEBUG, 20=INFO, 30=WARNING, 40=ERROR, 50=CRITICAL
    LOGGER = Logger('FlaskAppWrapper', level=10)
    app = None

    def __init__(self, port=5000, upload_dir=None):
        self.logger = FlaskAppWrapper.LOGGER

        self.app = Flask(__name__)

        self.port = port
        Bootstrap(self.app)
        CORS(self.app)


        self.app.secret_key = 'my precious'

        self.app.config['SECRET_KEY'] = 'secret!'
        self.app.config['DEBUG'] = True
        self.app.config["UPLOAD_DIR"] = upload_dir 
        #self.app.permanent_session_lifetime = timedelta(minutes=5)
        
        self.service_thread = None


        
        self.socketio = SocketIO(self.app, async_mode=None, logger=True, engineio_logger=True)

        self.background_thread = None
        self.is_background_thread_stop = True





    '''
    '''
    def __del__(self):
        self.logger.log("__del__:" + self.__class__.__name__)


    def run_looper(self):
        self.socketio.run(self.app, host='0.0.0.0', port=self.port, debug=False)
        #self.socketio.run(self.app, host='0.0.0.0', port=self.port, debug=True)
        #self.app.run()



    def start_servie(self):
        self.service_thread = threading.Thread(target=self.run_looper)
        self.service_thread.start()

        self.logger.WAN("start_servie; Started")




    def add_endpoint(self, endpoint, endpoint_name, handler, methods=None):
        self.app.add_url_rule(rule=endpoint, endpoint=endpoint_name, methods=methods, view_func=EndpointAction(handler))


    def set_sockio_event_handler(self, event, handler, namespace=None):
         self.socketio.on_event(event, handler, namespace=namespace)



    def sockio_emit_event(self, event, payload, namespace=None):
        self.logger.INF("sockio_emit_event; " + event + ":" + json.dumps(payload))

        self.socketio.emit(event, payload, namespace=namespace)



    def start_sockio_background(self, task):
        if self.background_thread != None:
            self.logger.WAN("start_sockio_background; been already run")
            return
        self.is_background_thread_stop = False
        self.background_thread = self.socketio.start_background_task(task)

        self.logger.WAN("start_sockio_background; Started")


    def stop_sockio_background(self):
        self.is_background_thread_stop = True
        self.background_thread = None

    def is_sockio_background_quit(self):
        return self.is_background_thread_stop
