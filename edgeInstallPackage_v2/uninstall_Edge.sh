#!/bin/sh

#  
#  stop container, remove contaner & image
#  Remove Docker 
#

sudo docker stop $(docker ps -q)
sudo docker rm $(docker ps -a -q)
sudo docker rmi $(docker images -q)
sudo docker network rm internalNet

#apt list --installed | grep docker
#apt list --installed | grep contai

sudo systemctl stop docker.service
sudo systemctl stop containerd.service


#dpkg -l|grep container
#dpkg -l|grep docker

#sudo apt remove -y docker-ce
#sudo apt remove -y docker-ce-cli
#sudo apt remove -y containerd.io


sudo apt-get purge -y docker-ce docker-ce-cli containerd.io 
##. !!! !!! 

sudo rm -rf /var/lib/docker


sudo deluser admin docker



#  
#  Stop unregi web dashboard
#  Disable it 
#

#systemctl list-units --type service

sudo systemctl stop gatewayWeb.service

sudo systemctl disable gatewayWeb.service


#  
#  Remove rogrotate config file
#


sudo rm /etc/logrotate.d/controlModuleLog 
sudo rm /etc/logrotate.d/docker-container
sudo rm /etc/logrotate.d/gatewayWebLog

#  
#  Remove python lib package
#


pip3 uninstall -r ~/projects/requirements.txt -y
sudo apt-get -qq remove -y python3-pip
##. !!! !!! 

#  
#  Remove untar directories
#

sudo rm -rf ~/projects/
sudo rm -rf ~/sharedFolder/
sudo rm -rf ~/training/
sudo rm -rf ~/exDisk/

sudo rm ~/gatewayHostPackage_202201.tar


# reboot

sudo reboot













