#!/bin/bash

echo "Current Directory: ${PWD}"

if [ ${PWD} == "/home/admin" ];
then
echo "Start installation of Edge Gateway..."
else
echo "Error... Wrong directory to run this script.."
exit
fi


date
start_time="$(date -u +%s)"



if [ $(dpkg-query -W -f='${Status}' curl 2>/dev/null | grep -c "ok installed") -eq 0 ];
then
  apt-get install curl;
fi


curl -LO https://github.com/kosmo-nestfield/EdgeGW_Solution/raw/main/EdgeGateway%20Ver2.0/gatewayHostPackage_v2.tar
tar xvf gatewayHostPackage_v2.tar



sudo curl -fsSL https://get.docker.com/ | sudo sh

sudo usermod -aG docker $USER


# ! exit and logon again 

# verify imagename

sudo docker pull nestfield/controlmodule:220101  
sudo docker pull nestfield/opcuamodule:220923
sudo docker pull machbase/machbase:6.1.15
sudo docker pull eclipse-mosquitto:1.6.12
sudo docker pull nicolargo/glances:3.1.6.1


sudo docker network create --driver bridge internalNet


# !!!!!!!!!!!!!
# setting ..... sudo ip link set mtu 1442 dev


sudo docker run -d -it --name broker --hostname broker --network internalNet --restart=always eclipse-mosquitto:1.6.12
sudo docker run -d -it -p 5001:5001 --name tsDB --hostname tsDB --network internalNet --restart=always -v ~/sharedFolder:/home/machbase/sharedVolume --mount type=bind,source=/home/admin/exDisk,target=/home/machbase/backupVolume,bind-propagation=shared machbase/machbase:6.1.15
sudo docker run -d --name monitor -e GLANCES_OPT="-w" -v /var/run/docker.sock:/var/run/docker.sock:ro --pid host --network host --restart=always  -it nicolargo/glances:3.1.6.1
sudo docker run -d -it --name opcuaModule --hostname opcuaModule -p 4840:4840 --network internalNet -v ~/sharedFolder:/project/sharedVolume --restart=always --entrypoint '/bin/bash' nestfield/opcuamodule:220923
sudo docker run -d -it --name controlModule --hostname controlModule --network internalNet -v ~/sharedFolder:/project/sharedVolume --restart=always --entrypoint '/bin/bash' nestfield/controlmodule:220101



sudo cp ~/training/controlModuleLog /etc/logrotate.d/
sudo cp ~/training/docker-container /etc/logrotate.d/

sudo logrotate /etc/logrotate.conf




docker_end_time="$(date -u +%s)"

elapsed="$(($docker_end_time-$start_time))"
echo "Total of $elapsed seconds elapsed for Docker and container"

sudo apt-get install python3-pip 

##. !!! !!! 

# pip3 --default-timeout=1000 install -r ~/projects/requirements.txt
#pip3 install --no-index --find-links="/home/admin/pythonPackages" -r ~/projects/requirements.txt
pip3 install /home/admin/pythonPackages/*
pip3 install /home/admin/pythonPackages35/*


pip_end_time="$(date -u +%s)"

elapsed="$(($pip_end_time-$docker_end_time))"
echo "Total of $elapsed seconds elapsed for pip3 and python lib packages"

sudo cp ~/training/gatewayWeb.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable gatewayWeb.service
sudo systemctl start gatewayWeb.service

sleep 1

sudo cp ~/training/gatewayWebLog /etc/logrotate.d/gatewayWebLog
sudo logrotate /etc/logrotate.conf

service_end_time="$(date -u +%s)"

elapsed="$(($service_end_time-$pip_end_time))"
echo "Total of $elapsed seconds elapsed for web board service and its logrotae"

date

elapsed="$(($service_end_time-$start_time))"
echo "Total of $elapsed seconds elapsed for all the installation"

echo "------------------------------------------------------------"
echo "------------------------------------------------------------"

#echo "Now will set machbase DB"

#echo "Total of $elapsed seconds elapsed for all the installation"
cd ~/machDbSet
sudo ./setTsDb.sh


echo "All the setting for the machbase DB was completed"
