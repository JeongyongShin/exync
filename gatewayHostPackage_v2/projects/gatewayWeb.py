import json
import subprocess
from functools import wraps
from random import random
import time
import os
import threading
import schedule

#from datetime import timedelta
from datetime import datetime

import requests
import docker

from flask import render_template, redirect, session, flash, url_for, request, make_response, jsonify, app
from werkzeug.utils import secure_filename


from DockerHandler import DockerHandler
from MqttHandler import MqttHandler
from FlaskAppWrapper import FlaskAppWrapper


from GwConfig import GwConfig


from common.logger import Logger

# level : 0=NOTSET, 10=DEBUG, 20=INFO, 30=WARNING, 40=ERROR, 50=CRITICAL
logger = Logger('gatewayWeb', level=20)


version = "gateway.1.0.0-211203"

WEB_PORT = 5000
#WEB_UPLOAD_DIR = "/home/user/project/rain/sharedVolume"
WEB_UPLOAD_DIR = "/home/admin/sharedFolder"


'''
Module Handler
'''
dockerHandler = None
mqttHandler = None
flaskAppWrapper = None


'''
Global Variables
'''
mqttBrokerVer = None
dockerVer = None
hostOs = None
kTimer = 10


askingConfirm = False
pedingiSingleCredential = None
pendingRegiServer = None
pendingRegiID = None
pendingRegiPW = None
pendingTsdb = None

lastRegiFail = None

controlReport = {}
aggregationReport = {}

aggCertReady = False

gatewayName = None
cloudRegi = None
cloudAmqpCon = None
configFileRead = None
configUpdated = None
tsDBEntries = None
tsDbLastUpdated = None
sysMonReport = {}
containerReport = {}

tsDBContainerRun = False
regiInProgress = False
controlReqResult = False

numberOfUser = 0

gwConfig = None
GW_CONFIG_FILE = "/home/admin/sharedFolder/gateway.config"
webAdminPW = None

lastDataAccumCnt=0
backupVolReady = False

def print_HostOS():
    global hostOs
    sysCommand = "lsb_release -a"
    p = subprocess.Popen([sysCommand], stdout=subprocess.PIPE, shell=True)
    osDistroStr = p.stdout.read().decode("utf-8").split("\n")[1]
    osDistro = osDistroStr.split(":")[1]
    hostOs = osDistro.split('\t')[1].split('\n')[0].split('\n')[0]
    
    logger.INF("print_HostOS; hostOs=" + hostOs)


def load_gateway_config():
    global gwConfig
    global webAdminPW

    gwConfig = GwConfig(GW_CONFIG_FILE)
    if  gwConfig.isOK() : 
        logger.INF("load_gateway_config; adminPW=" + gwConfig.gwAdminPW)
        webAdminPW = gwConfig.gwAdminPW
    else :
        exit()

def updateNullContainerReport(containerName):
 
        global containerReport

        data={}
        data["name"] = containerName
        data["status"] = "unknown"
        data["image"] = "unknown"
        data["cpuLoad"] = 0.0
        data["memoryLoad"] = 0.0
        data["memoryLimit"] = 0.0

        containerReport["arg"].append(data)


def update_control_report(jsonLoad):
    global controlReport

    global gatewayName
    global cloudRegi
    global cloudAmqpCon
    global configFileRead
    global configUpdated
    global tsDBEntries
    global tsDbLastUpdated

    global mqttBrokerVer
    global dockerVer

    controlReport = json.dumps(jsonLoad)
    
    logger.INF("update_control_report; controlReport=" + controlReport)

    for anArg in jsonLoad["arg"]:
        if anArg["arg"]=="control":
            gatewayName = anArg["name"]
            cloudRegi = anArg["cloudRegi"]
            cloudAmqpCon  =anArg["cloudAmqpCon"]
        if anArg["arg"]=="config":
            configFileRead  = anArg["file"]
            configUpdated = anArg["updated"]
        if anArg["arg"]=="tsDB":
            tsDBEntries = anArg["count"]
            tsDbLastUpdated = anArg["lastUpdated"]
    
    addData = {}
    addData["arg"]="broker"
    addData["version"] = mqttBrokerVer
    jsonLoad["arg"].append(addData)
    
    addData = {}
    addData["arg"] = "docker"
    addData["version"] = "Docker Version:" + dockerVer["Version"]
    jsonLoad["arg"].append(addData)

    print(controlReport)
    
    flaskAppWrapper.sockio_emit_event('controlReport', jsonLoad, namespace='/report')



    """
    regiEventMessage={
                        "message":"test is ......"
                       }

    flaskAppWrapper.sockio_emit_event('regiProgressEvent', regiEventMessage, namespace='/report')
    """
    

def update_aggregation_report(jsonLoad):
    global aggregationReport
    global aggCertReady

    aggregationReport = json.dumps(jsonLoad)

    logger.INF("update_aggregation_report; aggregationReport=" + aggregationReport)

    print(aggregationReport)

    for anArg in jsonLoad["arg"]:
        if anArg["arg"]=="files":
            aggCertReady = (anArg["cert"] == 'true')
            logger.INF("X.509 certification generated ? " + str(aggCertReady) )


    flaskAppWrapper.sockio_emit_event('aggregationReport', jsonLoad, namespace='/report')

"""
 aggregationReport={"src": "aggregation", "report": "status", "dst": "all", "arg": [{"qFull": "0", "opcuaConnection": "false", "serverReady": "true", "dataSent": "221246075", "numberOfdevice": 1, "arg": "opcua"}, {"infoModel": "true", "cert": "true", "syscfg": "true", "arg": "files", "engineering": "true"}, {"up": "2021-09-29 15:11:15", "version": "Agg:2020.09.08.build-1", "arg": "application"}]}

"""


"""
backupInProgress = False

def backupTsDb():
    global backupInProgress
    if backupInProgress == False:
        backupInProgress = True
        logger.INF("backupTsDb; .....------------------------------------..............")
        dockerHandler.backupContainerWithName("tsDB")
        #dockerHandler.backupContainerWithName("broker")
"""
def backupTsDb():

    global lastDataAccumCnt

    TEST_MON_FILE = "/home/admin/sharedFolder/test2.mon"
    testLogString = ""
    testLogString = datetime.now().strftime('%Y-%m-%d %H:%M:%S')+" !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! \n"
    logger.INF("backupTsDb !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!         "+str(backupVolReady))

    """
    if lastDataAccumCnt>0 and backupVolReady == True:
    #if datetime.now().weekday() == 0:
        testLogString = datetime.now().strftime('%Y-%m-%d %H:%M:%S')+"USB disk Available..  backupTsDb ...... Full Backup \n"
        os.system("docker exec -t tsDB sudo /home/machbase/sharedVolume/fullDbBackup.sh &")    
    else:
        testLogString = datetime.now().strftime('%Y-%m-%d %H:%M:%S')+" "+str(lastDataAccumCnt)+", "+str(backupVolReady)+" \n"

    """
    
    if backupVolReady == True:
        #if datetime.now().minute == 30:
        #if datetime.now().weekday() == 0:
        if datetime.now().weekday() == 1:
            testLogString = datetime.now().strftime('%Y-%m-%d %H:%M:%S')+" backupTsDb ...... Full Backup \n"
            os.system("docker exec -t tsDB sudo /home/machbase/sharedVolume/fullDbBackup.sh &")
        else:
            if lastDataAccumCnt > 0:
                testLogString = datetime.now().strftime('%Y-%m-%d %H:%M:%S')+" backupTsDb ...... Incremental Backup \n"
                os.system("docker exec -t tsDB sudo /home/machbase/sharedVolume/incDbBackup.sh &")
            else:
                testLogString = datetime.now().strftime('%Y-%m-%d %H:%M:%S')+" "+str(lastDataAccumCnt)+", "+str(backupVolReady)+" \n"

    

    """
    if lastDataAccumCnt>0:
        testLogString = datetime.now().strftime('%Y-%m-%d %H:%M:%S')+" backupTsDb ...... accummed data for Today : "+str(lastDataAccumCnt) +"\n"
        os.system("docker exec -t tsDB sudo /home/machbase/sharedVolume/durDbBackup.sh &")

        lastDataAccumCnt = 0

    else:
        testLogString = datetime.now().strftime('%Y-%m-%d %H:%M:%S')+" backupTsDb ...... Skip backup for Today : " +"\n"
    """


    with open(TEST_MON_FILE, "a") as testLog:
        testLog.write(testLogString)


#schedule.every().minute.at(":10").do(backupTsDb)
#schedule.every().hour.at(":26").do(backupTsDb)
#schedule.every().day.at("00:10").do(backupTsDb)
schedule.every().day.at("14:45").do(backupTsDb)
#schedule.every().saturday.at("01:10").do(backupTsDb)

brokerMemUseMax = 30.0

def monitorContainers():

    global containerReport
    global brokerMemUseMax
    global tsDBContainerRun
    global regiInProgress
    global gwConfig
    global flaskAppWrapper

    containerReport = dockerHandler.getContainerReport()
    timer = threading.Timer(20, monitorContainers)
    timer.start()

    #logger.INF("monitorContainers; containerReport=" + json.dumps(containerReport))

    logger.INF("monitorContainers; gwConfig.tsDBUse ?" + str(gwConfig.tsDbUse))

    containerReport["timestamp"] = datetime.now().timestamp()




    for data in containerReport["arg"]:
        #{"cpuLoad": 44.24337019417476, "image": "machbase/machbase:6.1.14", "memoryLoad": 46.28, "name": "tsDB", "status": "running"}
        if data["name"] == "tsDB":
            logger.INF("tsDB load (CPU, Mem %) "+ str(data["cpuLoad"]) + ", " + str(data["memoryLoad"])+", mem max use :"+str(data["memoryLimit"]))
            if data["status"] == "running" and gwConfig.tsDbUse == False:

                dockerHandler.stopContainerWithName('tsDB')
                tsDBContainerRun = False
                
            elif data["status"] == "running" and regiInProgress == False:
                tsDBContainerRun = True

        if data["name"] == "broker":
            logger.INF("broker load (CPU, Mem %) "+ str(data["cpuLoad"]) + ", " + str(data["memoryLoad"])+", mem max use :"+str(data["memoryLimit"]))         
            if data["memoryLimit"] < 7516192768.0:
                # if less than 7G
                brokerMemUseMax= 80.0
            if data["memoryLoad"] > brokerMemUseMax:
                dockerHandler.restartContainerWithName("broker")

    logger.INF("monitorContainers; tsDBContainerRun?" + str(tsDBContainerRun))
    if tsDBContainerRun != True:
        updateNullContainerReport("tsDB")

    if  gwConfig.tsDbUse == True and tsDBContainerRun == False:
        dockerHandler.restartContainerWithName("tsDB")
        tsDBContainerRun = True

aggConTesting = 0


def restartContainer():
    global numberOfUser
    global aggConTesting
    global kTimer

    if aggConTesting > 0:
        logger.INF(" Restarting ...................  controlModule !!!!!!!!!!!!")
        dockerHandler.restartContainerWithName("controlModule")

        if numberOfUser == 0:
            mqtt_send_command_report_state(False)
    else: 
        dockerHandler.restartContainerWithName("broker")
    
    aggConTesting = 0
    kTimer = 10
    monitorKeepAlive()

def monitorKeepAlive():
    global kTimer
    global aggConTesting

    if kTimer != 0 :
        timer = threading.Timer(10, monitorKeepAlive)
        timer.start()
        logger.INF(" monitorKeepAlive ................... :"+str(kTimer))
        kTimer -= 1
        if kTimer < 8:
            logger.INF(" Start Sending KeepAlive for Agg. with data 2 ")
            mqttHandler.publish("KeepAlive", "2")

        schedule.run_pending()

    else:
        logger.INF(" WARNING.... KeepAlive FAIL")
        
        if cloudRegi == True:
            logger.INF(" WARNING.... schedule for restarting control container.....")
            aggConTesting = 1
            mqtt_send_command_report_state(True)
            timer = threading.Timer(10, restartContainer)
            timer.start()
        else:
            logger.INF(" WARNING.... cloudRegi is not sure.. Skip restarting control container.....")
            kTimer = 10
            monitorKeepAlive()


def resetRegistration():

    global tsDBContainerRun

    logger.INF(" .... Requesting to reset gateway.config into default non-registered state with app reload option")
    cmdJson = {"src": "admin",
               "cmd": "resetConfigFile",
               "arg": ['true']
              }

    mqttHandler.publish("COMMAND", json.dumps(cmdJson))

    if tsDBContainerRun:
        dockerHandler.stopContainerWithName('tsDB')
        tsDBContainerRun = False
        gwConfig.tsDbUse = False
        updateNullContainerReport("tsDB")



'''
MQTT stuff
'''
#def mqttTopicHandlerOnEVENT(payload):
def mqttTopicHandlerOnEVENT(topic,payload):
    global kTimer
    global cloudRegi
    global lastRegiFail
    global controlReqResult

    logger.INF("mqttTopicHandlerOnEVENT; payload=" + str(payload.decode("utf-8")))
    jsonLoad = json.loads(str(payload.decode("utf-8")))


    if topic == 'KeepAlive' and int(payload) == 1:
        #logger.INF("mqttTopicHandlerOnEVENT; GOT KeepAlive ................. from control module")
        kTimer = 10
    elif topic == 'regiEvent':

        """
        regiEventMessage={
                 "message":"downloaded ",
                 "downloaded":str(jsonLoad["file"]),
                 "time":datetime.now().timestamp()
                }
        """
        regiEventMessage={
                 "event":jsonLoad["event"],
                 "time":datetime.now().timestamp()
                }
        if jsonLoad["event"] == "fileDownload":
            # {"dst":"","src":"control","event":"fileDownload", "result": "false", "error":"download fail"}
            if jsonLoad["result"]== "false":
                cloudRegi = (jsonLoad["result"]=="true") 
                lastRegiFail = jsonLoad["error"]
                logger.INF("**********************-------------------- "+str(cloudRegi))

            regiEventMessage["file"] = str(jsonLoad["file"])
        elif jsonLoad["event"] == "AMQPServerConnect":
            # {"dst":"","src":"control","event":"AMQPServerConnect", "result": "false", "error":"AMQP Error. ex.Authentication Failure or wrong cloud server IP address"}'
            if jsonLoad["result"]== "false":
                cloudRegi = (jsonLoad["result"]=="true") 
                lastRegiFail = jsonLoad["error"]
                logger.INF("**********************-------------------- "+str(cloudRegi))

        flaskAppWrapper.sockio_emit_event('regiProgressEvent', regiEventMessage, namespace='/report')

        #cloudRegi = (jsonLoad["result"]=="true") 
        #logger.INF("**********************-------------------- "+str(cloudRegi))
        #if cloudRegi == False:
        if  (jsonLoad["result"]=="true")== False:
            lastRegiFail = jsonLoad["error"]
            logger.INF(lastRegiFail)
    elif  topic == 'EVENT':
        if jsonLoad["type"] == "forRequest":
            controlReqResult = (jsonLoad["result"]=="true")
        elif jsonLoad["type"] == "notification":
            if jsonLoad["message"]=="checkEdgeHub":
                logger.INF(" Will check EdgeHub container is ready or not")

    else:
        logger.INF("mqttTopicHandlerOnEVENT; payload=" + str(payload.decode("utf-8")))

def mqttTopicHandlerOnSYSBrockerVer(topic,payload):
    logger.INF("mqttTopicHandlerOnSYSBrockerVer; payload=" + str(payload.decode("utf-8")))

    global mqttBrokerVer
    
    mqttBrokerVer = str(payload.decode("utf-8"))
    logger.INF("mqttTopicHandlerOnSYSBrockerVer; mqttBrokerVer=" + mqttBrokerVer)

def mqttTopicHandlerOnREPORT(topic,payload):
    global aggConTesting

    global lastDataAccumCnt
    global backupVolReady

    global containerReport
    global sysMonReport

    logger.INF("mqttTopicHandlerOnREPORT; payload=" + str(payload.decode("utf-8")))
    jsonLoad = json.loads(str(payload.decode("utf-8")))

    if jsonLoad["report"]=="status" and jsonLoad["src"]=="control":
        logger.INF("mqttTopicHandlerOnREPORT; call update_control_report()")
        update_control_report(jsonLoad)
        flaskAppWrapper.sockio_emit_event('containerReport', containerReport, namespace='/report')
        flaskAppWrapper.sockio_emit_event('sysMonReport', sysMonReport, namespace='/report')

    if jsonLoad["report"]=="status" and jsonLoad["src"]=="aggregation":
        logger.INF("mqttTopicHandlerOnREPORT; call update_aggregation_report()")
        if aggConTesting != 0:
            aggConTesting += 1

        update_aggregation_report(jsonLoad)

    if jsonLoad["report"]=="lastDataCnt":
        logger.INF("mqttTopicHandlerOnREPORT; got lastDataCnt")

        lastDataAccumCnt=jsonLoad["arg"][0]
        backupVolReady=jsonLoad["arg"][1]

        logger.INF("mqttTopicHandlerOnREPORT; lastDataAccumCnt "+str(lastDataAccumCnt))

        TEST_MON_FILE = "/home/admin/sharedFolder/test2.mon"
        testLogString = datetime.now().strftime('%Y-%m-%d %H:%M:%S')+" mqttTopicHandlerOnREPORT ...... accummed data for Today : "+ str(jsonLoad["arg"]) +"\n"
        with open(TEST_MON_FILE, "a") as testLog:
            testLog.write(testLogString)




def mqtt_send_command_report_state(switch=False):
    global mqttHandler

    argVal = "false"

    if switch == True:
        argVal = "true"

    cmdJson = {"src": "admin",
				"cmd": "reportStatus",
				"arg": [argVal]
				}

    mqttHandler.publish("COMMAND", json.dumps(cmdJson))



def init_mqtt_handler():
    global  mqttHandler

    sysCommand = "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' broker"
    p = subprocess.Popen([sysCommand], stdout=subprocess.PIPE, shell=True)
    
    MQTT_HOST = p.stdout.read().decode("utf-8").split("\n")[0]
    MQTT_PORT = 1883

    logger.INF("init_mqtt_handler; brocker=" + MQTT_HOST + ":" + str(MQTT_PORT))

    mqttHandler = MqttHandler(MQTT_HOST, MQTT_PORT)

    mqttHandler.set_topic_handler('REPORT', mqttTopicHandlerOnREPORT)
    mqttHandler.set_topic_handler('EVENT', mqttTopicHandlerOnEVENT)
    mqttHandler.set_topic_handler('regiEvent', mqttTopicHandlerOnEVENT)
    mqttHandler.set_topic_handler('KeepAlive', mqttTopicHandlerOnEVENT)
    mqttHandler.set_topic_handler('$SYS/broker/version', mqttTopicHandlerOnSYSBrockerVer)
    mqttHandler.start_consume()

    mqtt_send_command_report_state(False)



'''
Docker stuff
'''
def init_docker_handler():
    global  dockerHandler
    global  dockerVer
    global containerReport

    dockerHandler = DockerHandler()
    dockerVer = dockerHandler.getDockerVersion()
    monitorContainers()
    #containerReport = dockerHandler.getContainerReport()
    #logger.INF("init_docker_handler; containerReport=" + json.dumps(containerReport))


'''
Flask stuff
'''

"""
@flaskAppWrapper.app.before_request
def make_session_permanent():
    flaskAppWrapper.session.permanent = True
    flaskAppWrapper.app.permanent_session_lifetime = timedelta(minutes=3)
"""







def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            flash('You need to login first.')
            return redirect(url_for('login'))
    return wrap



@login_required
def web_index():
    return render_template('gwIndex.html', controlStatus=controlReport, who={"name":"logan"})


def web_login():


    global containerReport
    error = None
    if request.method == 'POST':
        #if request.form['username'] != 'admin' or request.form['password'] != 'logan':
        logger.INF(" login is tried with password " + request.form['password'])
        if request.form['username'] != 'admin' or request.form['password'] != webAdminPW:
            error = 'invalid credentials. please try again.'
        else:
            session['logged_in'] = True
            session.permanent = True
            flash('you were logged in.')    
            
            flaskAppWrapper.sockio_emit_event('containerReport', containerReport, namespace='/report')


            return redirect(url_for('index'))
    
    return render_template('login.html', error=error)


@login_required
def web_logout():
    session.pop('logged_in', None)
    flash('you were logged out.')
    return redirect(url_for('login'))

@login_required
def changePassword():
    global controlReqResult
    global webAdminPW

    data = request.get_json()
    service = data['service']
    accountId = data['username']
    oldPassword = data['oldPassword']
    newPassword = data['newPassword']

    oldVerified = "false"

    logger.INF("passsword change request............old password " + oldPassword)
    logger.INF("passsword change request............ current password" + webAdminPW)

    if service == "admin" and oldPassword == webAdminPW:
        oldVerified = "true"


        cmdJson = {"src": "admin",
                   "cmd": "changePassword",
                   "arg": [ service, oldPassword, newPassword, oldVerified]
                  }
        mqttHandler.publish("COMMAND", json.dumps(cmdJson))
    else:
        resultMsg=" check ID or current Password"
        return make_response(jsonify({"message":resultMsg, "result": "false"}), 200)


    i= 0

    while i < 20:
       logger.INF("controlReqResult for password change............ " + str(controlReqResult))
       if controlReqResult == True:
            break
       i += 1
       time.sleep(1)

    resultMsg="Password change completed"

    if controlReqResult == False:
       resultMsg="Unknown"
    else:
       if service == "admin": 
           webAdminPW = newPassword
           logger.INF("password was changed with new password............ " + webAdminPW)
           controlReqResult = False

    return make_response(jsonify({"message":"password change requested", "result": resultMsg}), 200)


@login_required
def web_reportStatus():

    #test
    #dockerHandler.commitContainerWithName("broker")


    mqtt_send_command_report_state(True)
    cmdJson = {"src": "admin",
               "cmd": "resetCounts",
               "arg": []
              }
    mqttHandler.publish("COMMAND", json.dumps(cmdJson))


    return controlReport


@login_required
def web_gatewayRegi():
    cmdJson = {"src": "admin",
				"cmd": "startGwRegi",
				"arg": []
				}
    mqttHandler.publish("COMMAND", json.dumps(cmdJson))

    return make_response(jsonify({"message":"registration requested"}), 200)

@login_required
def web_modalRegi_submit():



    global askingConfirm
    global pedingiSingleCredential
    global pendingRegiServer
    global pendingRegiID
    global pendingRegiPW
    global pendingTsdb

    global tsDBContainerRun

    global regiInProgress
    global lastRegiFail

    data=request.get_json()

    if askingConfirm==False:

                                

        confirmAsk='사전에 gateway.config파일 안에 각 ID와 encrypt된 암호파일이 설정되어야 합니다.<br> 등록하시겠습니까? <br><button class="btn btn-primary"  data-target="#ModalExample" onclick="registerGw_new();">Register</button> <button class="btn btn-primary"  data-dismiss="modal">Cancel</button> '

        if data['tsDbOpt'] !='disable':
            useTsdb = "true"
            tsDbSol = data['tsDbOpt']
        else:
            useTsdb = "false"
            tsDbSol = "none"

        logger.INF("singlId.....  "+ str(data['singleId']))

        if data['singleId']:
            singleCredential="true"
        else:
            singleCredential="false"

            askingConfirm=True
            
            pedingiSingleCredential="false"
            pendingRegiServer=data['regiServer']
            pendingRegiID=data['regiId']
            pendingRegiPW=data['password']
            pendingTsdb=useTsdb

            return make_response(jsonify({"message":"registration requested", "result": confirmAsk}), 200)

        if useTsdb == "true" and tsDBContainerRun != True:

              dockerHandler.restartContainerWithName('tsDB')
                                
        regiInProgress = True

        cmdJson = {"src": "admin",
                   "cmd": "startGwRegi",
                   "arg": [ singleCredential, data['regiServer'], data['regiId'], data['password'], useTsdb, tsDbSol ]
                  }
        mqttHandler.publish("COMMAND", json.dumps(cmdJson))

    else:

        regiInProgress = True

        cmdJson = {"src": "admin",
                   "cmd": "startGwRegi",
                   "arg": [ pedingiSingleCredential, pendingRegiServer, pendingRegiID, pendingRegiPW, pendingTsdb ]
                  }
        mqttHandler.publish("COMMAND", json.dumps(cmdJson))

    global cloudRegi
    cloudRegi = False

    i= 0

    while i < 20:
        logger.INF("-------------- web_modalRegi_submit i    "+str(i))
        if cloudRegi == True:
            break
        i += 1
        time.sleep(1)

    askingConfirm=False
    
    resultMsg='<label for="label1">&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Registration Completed</label>'

    if cloudRegi == False:
        #lastRegiFail = jsonLoad["error"]
        resultMsg = '<label for="label1">&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;'+lastRegiFail+'&nbsp; &nbsp; &nbsp; &nbsp; </label>'

    else:
        logger.INF("useTsdb is "+useTsdb+" pendingTSdb is "+str(pendingTsdb)+". tsDBContainerRun is "+str(tsDBContainerRun))
        if (useTsdb=="false" or pendingTsdb == "false") and tsDBContainerRun:
            dockerHandler.stopContainerWithName('tsDB')
            gwConfig.tsDbUse = False
            tsDBContainerRun = False
        elif useTsdb=="true" or pendingTsdb == "true":
            gwConfig.tsDbUse = True


    regiInProgress = False

    return make_response(jsonify({"message":"registration requested", "result": resultMsg, "time":datetime.now().timestamp()}), 200)


@login_required
def web_restart():
    if request.method == 'POST':
        if request.json['target']=="container":
            dockerHandler.restartContainerWithName(request.json['name'])

    return make_response(jsonify({"message":"restart requested"}), 200)

"""
@login_required
def web_notify():
    cmdJson = {"src": "cloud",
				"cmd": "getFile",
				"arg": ["device.xml","zzzz.json","agg.xml"]
				}
    mqttHandler.publish("FCOMMAND", json.dumps(cmdJson))

    return render_template('upload.html')
"""

@login_required
def web_upload_index():
    return render_template('upload.html')

@login_required
def web_regi_index():
    return render_template('regiGw.html')

@login_required
def web_upload_file():
    if request.method == 'POST':
        f = request.files['file']
        f.save(os.path.join(WEB_UPLOAD_DIR, secure_filename(f.filename)))

        # ADD file read and parsing..
        # publish mqtt message to opcus module for reading xxx.json file.
        cmdJson = {"src": "cloud",
                        "cmd": "getFile",
                        "arg": ["device.xml","zzzz.json","agg.xml"]
                        }
        mqttHandler.publish("FCOMMAND", json.dumps(cmdJson))

        return "File was uploaded successfully"

@login_required
def web_regi_submit():

    global askingConfirm
    global pedingiSingleCredential
    global pendingRegiServer
    global pendingRegiID
    global pendingRegiPW
    global pendingTsdb

    global tsDBContainerRun

    if askingConfirm==False:

        confirmAsk='사전에 gateway.config파일 안에 각 ID와 encrypt된 암호파일이 설정되어야 등록이 가능합니다. 등록하시겠습니까?<br><form action="registerSubmit" method="post"><input class="btn btn-default" type="submit" value="등록"></form>'


        if request.form['tsDbOpt'] !='disable':
            useTsdb = "true"
            tsDbSol = request.form['tsDbOpt']
        else:
            useTsdb = "false"
            tsDbSol = "none"


        """
        if request.form.get('tsDb'):
            useTsdb="true"
        else:
            useTsdb="false"
        """

        if request.form.get('singleId'):
            singleCredential="true"
        else:
            singleCredential="false"

            askingConfirm=True
            
            pedingiSingleCredential="false"
            pendingRegiServer=request.form['regiServer']
            pendingRegiID=request.form['regiId']
            pendingRegiPW=request.form['password']
            pendingTsdb=useTsdb

            #ret:set각 ID와 encrypt된 암호가 설정되어야 등록이 가능합니다. 등록하시겠습니까?" 
            return confirmAsk

        """
        regiData = {

                "ip":request.form['regiServer'],
                "id":request.form['regiId'],
                "pw":request.form['password'],
                "single":singleCredebtial,
                "tsDB":useTsdb 


                }
        return regiData
        """

        if tsDBContainerRun != True:

              dockerHandler.restartContainerWithName('tsDB')
                                


        cmdJson = {"src": "admin",
                   "cmd": "startGwRegi",
                   "arg": [ singleCredential, request.form['regiServer'], request.form['regiId'], request.form['password'], useTsdb, tsDbSol ]
                  }
        mqttHandler.publish("COMMAND", json.dumps(cmdJson))

    else:

        cmdJson = {"src": "admin",
                   "cmd": "startGwRegi",
                   "arg": [ pedingiSingleCredential, pendingRegiServer, pendingRegiID, pendingRegiPW, pendingTsdb ]
                  }
        mqttHandler.publish("COMMAND", json.dumps(cmdJson))

    global cloudRegi
    cloudRegi = False

    i= 0

    while i < 20:
        if cloudRegi == True:
            break
        i += 1
        time.sleep(1)

    askingConfirm=False
    
    resultMsg="registration completed"

    if cloudRegi == False:
        resultMsg="registration result unknown"

    returnHtml= "result:"+ resultMsg+'<br><div><form action="" onsubmit="return closeSelf(this);" ><div><input type="submit" value="OK"/></div></form><script type="text/javascript">function closeSelf (f) {f.submit();window.close();}</script></div>'
    #return returnHtml

    return make_response(jsonify({"message":"registration requested", "result": resultMsg}), 200)
    #return make_response(jsonify({"message":"registration requested", "result": "just test"}), 200)



@login_required
def web_createCert():
    cmdJson = { 
                "dst": "aggregation",
                "src": "admin",
                "cmd": "genCert",
                "arg": []
                }
    #logger.INF(str(cmdJson))
    mqttHandler.publish("COMMAND", json.dumps(cmdJson))


    return make_response(jsonify({"message":"createCert requested"}), 200)


"""
def web_guestbook():
    return render_template("index3.html", who={"name":"logan"})


def create_entry():
    req = request.get_json()
    logger.INF("create_entry; req=" + req)

    res = make_response(jsonify({"message":req["message"] }), 200)
    return res
"""

def sockio_connect():
    # need visibility of the global thread object
    global thread
    print('Web Client connected----')


    global numberOfUser

    numberOfUser = numberOfUser+1

    logger.INF("sockio_connect; numberOfUser=" + str(numberOfUser))

    if  numberOfUser > (0):
        mqtt_send_command_report_state(True)
        flaskAppWrapper.start_sockio_background(sockio_background_task)


def sockio_disconnect():

    global numberOfUser
    
    numberOfUser = numberOfUser-1

    logger.INF("sockio_disconnect; numberOfUser=" + str(numberOfUser))

    if numberOfUser == 0:
        mqtt_send_command_report_state(False)
        flaskAppWrapper.stop_sockio_background()


def get_performence_data(key):
    data = {}
    glan_url = "http://127.0.0.1:61208/api/3/" + key
    
    try:
        res = requests.get(glan_url)
        data["arg"] = key
        data["data"] = json.loads(res.text)
    except:
        logger.ERR("fail get glances requests:" + glan_url)

    return data


def sockio_background_task():

    logger.INF("sockio_background_task; Begin")

    global flaskAppWrapper
    global numberOfUser

    global containerReport
    global sysMonReport

    global hostOs

    monErrorCnt = 0

    flaskAppWrapper.sockio_emit_event('containerReport', containerReport, namespace='/report')

    while flaskAppWrapper.is_sockio_background_quit() == False:

        '''
        glan_url = 'http://127.0.0.1:61208/api/3/' + 'load'
        res = requests.get(glan_url)
        print(res.content)
        '''

        logger.INF( " number of connected user : "+str(numberOfUser))

        if numberOfUser > 0:
  
            
            number = round(random()*10, 3)
            logger.DBG("sockio_background_task; rand number=" + str(number))
            flaskAppWrapper.sockio_emit_event('newnumber', {'number': number}, namespace='/report')

            #logger.INF( " Will get contaier report.. calling docker Handler ")
            #containerReport = dockerHandler.getContainerReport()

            #flaskAppWrapper.sockio_emit_event('containerReport', containerReport, namespace='/report')

            queries=["load","mem","uptime","system","ip"]
            sysMonReport["arg"] = []            

            for aQuery in queries:

                aSysData = get_performence_data(aQuery)

                if 'data' not in aSysData:
                    monErrorCnt = monErrorCnt +1
                    logger.INF( " ............. 'monitor' container is not responding ? ........ "+str(monErrorCnt))
                    if monErrorCnt > 30:
                        logger.INF( " ............. will restart 'monitor' container ..! ")
                        dockerHandler.restartContainerWithName("monitor")
                        monErrorCnt = 0
                else:
                
                    if aQuery == "system":
                        aSysData["data"]["linux_distro"] = hostOs
                        aSysData["data"]["gatewayWeb"] = version

                    sysMonReport["arg"].append(aSysData)


            """
            sysMonReport["arg"].append(get_performence_data("load"))
            sysMonReport["arg"].append(get_performence_data("mem"))
            sysMonReport["arg"].append(get_performence_data("uptime"))
            sysMonReport["arg"].append(get_performence_data("system"))
            sysMonReport["arg"].append(get_performence_data("ip"))

            logger.DBG("sysMonReport[arg][3]=" + json.dumps(sysMonReport["arg"]))

            if 'data' in sysMonReport["arg"][3]:
                sysMonReport["arg"][3]["data"]["linux_distro"] = hostOs
                sysMonReport["arg"][3]["data"]["gatewayWeb"] = version
            """

            sysMonReport["src"] = "admin"
            sysMonReport["report"] = "system"
            sysMonReport["timestamp"] = datetime.now().timestamp()
            
            #flaskAppWrapper.sockio_emit_event('sysMonReport', sysMonReport, namespace='/report')

            time.sleep(3)

    logger.INF("Stopped sockio_background_task")



def init_FlaskAppWrapper_handler():
    global  flaskAppWrapper

    flaskAppWrapper = FlaskAppWrapper(port=WEB_PORT, upload_dir=WEB_UPLOAD_DIR)

    flaskAppWrapper.add_endpoint('/', 'index', web_index, methods=['GET'])
    flaskAppWrapper.add_endpoint('/login', 'login', web_login, methods=['GET','POST'])
    flaskAppWrapper.add_endpoint('/logout', 'logout', web_logout, methods=['GET'])
    flaskAppWrapper.add_endpoint('/reportStatus', 'reportStatus', web_reportStatus, methods=['GET'])
    flaskAppWrapper.add_endpoint('/gatewayRegi', 'gatewayRegi', web_gatewayRegi, methods=['GET'])
    flaskAppWrapper.add_endpoint('/registerHtml', 'registerHtml', web_regi_index, methods=['GET','POST'])
    flaskAppWrapper.add_endpoint('/registerSubmit', 'registerSubmit', web_regi_submit, methods=['GET','POST'])
    flaskAppWrapper.add_endpoint('/modalRegiSubmit', 'modalRegiSubmit', web_modalRegi_submit, methods=['GET','POST'])
    flaskAppWrapper.add_endpoint('/changePassword', 'changePassword', changePassword, methods=['GET','POST'])
    flaskAppWrapper.add_endpoint('/restart', 'restart', web_restart, methods=['GET','POST'])
    flaskAppWrapper.add_endpoint('/resetRegistration', 'resetRegistration', resetRegistration, methods=['GET','POST'])
#    flaskAppWrapper.add_endpoint('/notify', 'notify', web_notify, methods=['GET'])
    flaskAppWrapper.add_endpoint('/upload', 'upload', web_upload_index, methods=['GET'])
    flaskAppWrapper.add_endpoint('/uploader', 'uploader', web_upload_file, methods=['POST'])
    flaskAppWrapper.add_endpoint('/createCert', 'createCert', web_createCert, methods=['GET'])
    #flaskAppWrapper.add_endpoint('/guestbook', 'guestbook', web_guestbook, methods=['GET'])
    #flaskAppWrapper.add_endpoint('/guestbook/create-entry', 'create-entry', create_entry, methods=['POST'])

    flaskAppWrapper.set_sockio_event_handler('connect', sockio_connect, namespace='/report')
    flaskAppWrapper.set_sockio_event_handler('disconnect', sockio_disconnect, namespace='/report')




def main():

    print("print_HostOS()")
    print_HostOS()


    load_gateway_config()
    print("admin PW ", webAdminPW)


    print("init_mqtt_handler()")
    init_mqtt_handler()

    print("init_docker_handler()")
    init_docker_handler()

    print("init_FlaskAppWrapper_handler()")
    init_FlaskAppWrapper_handler()

    monitorKeepAlive()

    print("=======================================================")
    print("GatewayWeb Started, ver.", version)
    print("=======================================================")

    flaskAppWrapper.run_looper()

    print("=======================================================")
    print("GatewayWeb Stoped")
    print("=======================================================")

    mqttHandler.stop_consume()

if __name__ == '__main__':
    main()
    '''
    glan_url = 'http://www.google.com'
    res = requests.get(glan_url)
    print(res)
    '''

