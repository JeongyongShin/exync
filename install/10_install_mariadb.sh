#!/bin/bash

sudo apt-key adv --fetch-keys 'https://mariadb.org/mariadb_release_signing_key.asc'
sudo echo "deb [arch=amd64,arm64,ppc64el] https://ftp.harukasan.org/mariadb/repo/10.5/ubuntu bionic main" | sudo tee -a /etc/apt/sources.list.d/mariadb.list

sudo apt-get update
sudo apt-get -y install mariadb-server
