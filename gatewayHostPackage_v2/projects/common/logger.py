import logging
import json
import time
from datetime import datetime


'''
CRITICAL	50
ERROR	    40
WARNING	    30
INFO	    20
DEBUG	    10
NOTSET	    0

0=NOTSET, 10=DEBUG, 20=INFO, 30=WARNING, 40=ERROR, 50=CRITICAL

'''


class Logger:

    def __init__(self, name, level=20):
        self.name = name

        #logging.basicConfig(level=logging.ERROR, format='%(message)s')
        logging.basicConfig(level=logging.ERROR, format='%(asctime)s %(levelname)-8s %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
        self.logger = logging.getLogger(self.name)

        if level == 0 :
            self.logger.setLevel(logging.NOTSET)
        elif level <= 10 :
            self.logger.setLevel(logging.DEBUG)
        elif level <= 20 :
            self.logger.setLevel(logging.INFO)
        elif level <= 30 :
            self.logger.setLevel(logging.WARNING)
        elif level <= 40 :
            self.logger.setLevel(logging.ERROR)
        elif level <= 50 :
            self.logger.setLevel(logging.CRITICAL)
        else :
            self.logger.setLevel(logging.CRITICAL)
        

    def __timestamp(self):
        #return str(datetime.now(tz=self.local_tz).isoformat())
        return str(datetime.fromtimestamp(time.time()).isoformat())


    def __log(self, level=20, msg=""):
        return {
            'timestamp': self.__timestamp(),
            'component': self.name,
            'level': level,
            'msg': msg
        }

    '''
    def log(self, msg=""):
        self.logger.info(json.dumps(self.__log('INF', msg)))

    def DBG(self, msg=""):
        self.logger.debug(json.dumps(self.__log('DBG', msg)))

    def INF(self, msg=""):
        self.logger.info(json.dumps(self.__log('INF', msg)))

    def WAN(self, msg=""):
        self.logger.warning(json.dumps(self.__log('WAN', msg)))

    def ERR(self, msg=""):
        self.logger.error(json.dumps(self.__log('ERR', msg)))
    '''

    def log(self, msg=""):
        self.logger.info(self.name +":"+ msg)

    def DBG(self, msg=""):
        self.logger.debug(self.name +":"+ msg)

    def INF(self, msg=""):
        self.logger.info(self.name +":"+ msg)

    def WAN(self, msg=""):
        self.logger.warning(self.name +":"+ msg)

    def ERR(self, msg=""):
        self.logger.error(self.name +":"+ msg)
