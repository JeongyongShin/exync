import docker
from common.logger import Logger

class DockerHandler:
    'DockerHandler Class'
    '''
    '''
    # level : 0=NOTSET, 10=DEBUG, 20=INFO, 30=WARNING, 40=ERROR, 50=CRITICAL
    LOGGER = Logger('DockerHandler', level=20)



    def __init__(self):
        self.logger = DockerHandler.LOGGER

        self.dockerClient = docker.from_env()

        self.containerReport = {}
        self.containerReport["src"] = "admin"
        self.containerReport["report"] = "container"
        self.containerReport["arg"] = []


    '''
    '''
    def __del__(self):
        self.logger.log("__del__:" + self.__class__.__name__)


    def getDockerVersion(self):
        return self.dockerClient.version();



    def calculate_cpu_percent(self, d):

        """
        cpu_count = len(d["cpu_stats"]["cpu_usage"]["percpu_usage"])
        cpu_percent = 0.0
        cpu_delta = float(d["cpu_stats"]["cpu_usage"]["total_usage"]) - \
                    float(d["precpu_stats"]["cpu_usage"]["total_usage"])
        system_delta = float(d["cpu_stats"]["system_cpu_usage"]) - \
                       float(d["precpu_stats"]["system_cpu_usage"])
        if system_delta > 0.0:
            cpu_percent = cpu_delta / system_delta * 100.0 * cpu_count
        return cpu_percent
        """


        try:

            cpu_count = len(d["cpu_stats"]["cpu_usage"]["percpu_usage"])
            cpu_percent = 0.0
            cpu_delta = float(d["cpu_stats"]["cpu_usage"]["total_usage"]) - \
                        float(d["precpu_stats"]["cpu_usage"]["total_usage"])
            system_delta = float(d["cpu_stats"]["system_cpu_usage"]) - \
                           float(d["precpu_stats"]["system_cpu_usage"])
            if system_delta > 0.0:
                cpu_percent = cpu_delta / system_delta * 100.0 * cpu_count
            return cpu_percent


        except:
            return 0.0


    def calculate_cpu_mem_percent(self, d):


        cpuMem=[]

        try:

            cpu_count = len(d["cpu_stats"]["cpu_usage"]["percpu_usage"])
            cpu_percent = 0.0
            cpu_delta = float(d["cpu_stats"]["cpu_usage"]["total_usage"]) - \
                        float(d["precpu_stats"]["cpu_usage"]["total_usage"])
            system_delta = float(d["cpu_stats"]["system_cpu_usage"]) - \
                           float(d["precpu_stats"]["system_cpu_usage"])
            if system_delta > 0.0:
                cpu_percent = cpu_delta / system_delta * 100.0 * cpu_count

            cpuMem.append(cpu_percent)


            #total_mem_use = float(d["memory_stats"]["stats"]["total_pgpgin"]+ d["memory_stats"]["stats"]["total_pgpgout"]+d["memory_stats"]["stats"]["total_dirty"]+d["memory_stats"]["stats"]["total_rss"])
            total_mem_use = float(d["memory_stats"]["usage"]- d["memory_stats"]["stats"]["cache"])
            mem_limit=float(d["memory_stats"]["limit"])

            mem_percent = round(total_mem_use/mem_limit * 100.0, 2)
            cpuMem.append(mem_percent)
            cpuMem.append(mem_limit)

            return cpuMem


        except:
            return [0.0,0.0,0.0]



    def getContainerReport(self):

        self.containerReport["arg"]=[]
    
        for container in self.dockerClient.containers.list():
            data={}
            data["name"] = container.name
            data["status"] = container.status
            data["image"] = str(container.image).split('\'')[1]
            #data["cpuLoad"] = self.calculate_cpu_percent(container.stats(stream=False))
            
            cpuMemCalc = self.calculate_cpu_mem_percent(container.stats(stream=False))
            data["cpuLoad"] = cpuMemCalc[0]
            data["memoryLoad"] = cpuMemCalc[1]
            data["memoryLimit"] = cpuMemCalc[2]

            self.containerReport["arg"].append(data)
       
        return self.containerReport


    def restartContainerWithName(self, name):

        targetContainer = self.dockerClient.containers.get(name)
        targetContainer.restart();

    def stopContainerWithName(self, name):

        targetContainer = self.dockerClient.containers.get(name)
        targetContainer.stop();

    def startContainerWithName(self, name):

        targetContainer = self.dockerClient.containers.get(name)
        targetContainer.start();

    def backupContainerWithName(self, name):

        oldBackup=True

        try:
            image = self.dockerClient.images.get(name.lower()+":backup")
            #image = self.dockerClient.images.get("broker:backup")
        except docker.errors.ImageNotFound:
            oldBackup=False

        if oldBackup:
            self.logger.INF("Will delete old backup")
            self.dockerClient.images.remove(name.lower()+":backup")
            #self.dockerClient.images.remove("broker:backup")


        targetContainer = self.dockerClient.containers.get(name)
        self.logger.INF("Will Commit container " + name)

        targetContainer.commit(name.lower(),"backup")
        #targetContainer.commit("broker","backup")

        """

        image = self.dockerClient.images.get(name+":backup")
        saveimage=image.save(2097152,True)
        f = open('/home/admin/projects/'+name+'_backup.tar', 'wb')
        for chunk in saveimage:
            f.write(chunk)
        f.close()
        """

