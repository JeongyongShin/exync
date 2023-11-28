#!/bin/bash

git clone https://github.com/DaveGamble/cJSON.git
cd cJSON
sudo mkdir build
cd build
sudo cmake ..
sudo make clean
sudo make install
