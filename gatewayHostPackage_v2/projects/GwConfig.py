import json
from datetime import datetime

#from subprocess import check_output
import subprocess

from common.logger import Logger

class GwConfig:
    'GwConfig Class'

    # level : 0=NOTSET, 10=DEBUG, 20=INFO, 30=WARNING, 40=ERROR, 50=CRITICAL
    LOGGER = Logger('GwConfig', level=10)
    
    '''
    '''
    #def __init__(self, conf_fname="../sharedVolume/gateway.config"):
    def __init__(self, conf_fname="/home/admin/sharedFolder/gateway.config"):
        self.logger = GwConfig.LOGGER

        self.conf_fname = conf_fname

        self.gwConfig = None

        try:
            gwConfigFile = open(conf_fname)
            self.gwConfig = json.load(gwConfigFile)

            #self.gateway = self.gwConfig["gateway"]
            self.gateway = self.gwConfig["gatewayName"]

            """
            """
            self.gwAdminID = self.gwConfig["gwAdmin"]["id"]
            self.gwAdminIdCredentialPath = self.gwConfig["gwAdmin"]["credential"]

            self.tsDbUse = self.gwConfig["localTsDb"]["use"]
            self.tsDbSol = self.gwConfig["localTsDb"]["solution"]

            self.serverRegiCompleted = self.gwConfig["serverRegiCompleted"]
            self.aggServerReadySuccess = self.gwConfig["aggServerReadySuccess"]
            self.configUpdated = self.gwConfig["updated"]

            gwConfigFile.close()

            
        except IOError:
            self.logger.ERR("Could not open gateway.config file!")

        self.gwAdminPW = self.decryptIt(self.gwAdminIdCredentialPath)
        self.print()


    '''
    '''
    def __del__(self):
        self.logger.log("__del__:" + self.__class__.__name__)



    def decryptIt(self,filePath):

        defaultPassword = "nestfield"

        try:
            #decrypted=check_output(["./dna_decrypt", "/home/nestfield/sharedFolder/"+filePath])
            decrypted=subprocess.check_output(["./.dna_decrypt", "/home/admin/sharedFolder/"+filePath])
        except:
            return defaultPassword

        try: 
            clearPassword=decrypted.splitlines()[0].decode('utf-8').split(" ")[3]
        except:
            return defaultPassword
        return clearPassword


    '''
    '''
    def isOK(self):
        if self.gwConfig != None:  
            return True
        else:
            return False


    '''
    '''
    def print(self):
        if self.gwConfig != None:  
            print("-------- READ gateway.config --------------")
            print(self.gateway)
            print(self.gwAdminID)
            print(self.gwAdminPW)
            #print(self.cloudServerIP)
            #print(self.cloudServerKey)
            #print(self.amqpBroker)        
            #print(self.amqpAccessID)
            #print(self.amqpAccessPW)  
            print(self.serverRegiCompleted)  
            print(self.aggServerReadySuccess)
            print(self.configUpdated)
            print("---------------------------------------------")    
               
                
    '''
    '''
    def setProperty(self, key, value):
        self.gwConfig[key] = value


    '''
    '''
    def save(self):
        self.gwConfig["updated"] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        with open(self.conf_fname,'w') as ofile:
            json.dump(self.gwConfig, ofile, indent=4)





