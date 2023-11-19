#!/bin/bash

python -m pip install asyncua
python -m pip install glances
python -m pip install bottle
python -m pip install -Iv django==3.2.12

apt-get install -y libmysqlclient-dev
python -m pip install mysqlclient
python -m pip install xmlschema
python -m pip install xmltodict
python -m pip install influxdb
python -m pip install influxdb-client
python -m pip install pycrypto
python -m pip install django-revproxy
python -m pip install djangorestframework
python -m pip install "djangorestframework-api-key==2.*"
python -m pip install asyncua
python -m pip install python-magic
python -m pip install requests
