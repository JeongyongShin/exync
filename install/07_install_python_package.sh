#!/bin/bash


# Install system dependency
sudo apt-get install -y libmysqlclient-dev

# Install Python packages using conda and pip
# Add channels as necessary (e.g., conda-forge)
conda install -c conda-forge asyncua
conda install -c conda-forge glances
conda install -c conda-forge bottle
conda install -c conda-forge django=3.2.12
conda install -c conda-forge mysqlclient
conda install -c conda-forge xmlschema
conda install -c conda-forge xmltodict
conda install -c conda-forge influxdb
conda install -c conda-forge pycrypto
conda install -c conda-forge django-revproxy
conda install -c conda-forge djangorestframework
conda install -c conda-forge djangorestframework-api-key
conda install -c conda-forge python-magic
conda install -c conda-forge requests
pip install influxdb_client


