#!/bin/bash

git clone https://github.com/open62541/open62541.git
cd open62541
sudo mkdir build
cd build
sudo cmake -DBUILD_SHARED_LIBS=ON -DBUILD_STATIC_LIBS=ON -DUA_ENABLE_ENCRYPTION=OPENSSL ..
sudo make clean
sudo make install


