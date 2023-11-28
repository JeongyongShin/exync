#!/bin/bash

apt-get -y update
apt-get -y upgrade

apt-get install -y build-essential checkinstall
apt-get install -y libreadline-gplv2-dev libncursesw5-dev libssl-dev libsqlite3-dev
apt-get install -y tk-dev libgdbm-dev libc6-dev libbz2-dev zlib1g-dev
apt-get install -y openssl libffi-dev python3-dev python3-setuptools wget libcurl4-openssl-dev
apt-get install -y git libtool
apt-get install -y apt-transport-https
apt-get	install -y snapd
snap install core; sudo snap refresh core
