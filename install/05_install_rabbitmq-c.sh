#!/bin/bash

git clone https://github.com/alanxz/rabbitmq-c.git
cd rabbitmq-c
sudo mkdir build
cd build
sudo cmake ..
sudo make clean
sudo make install
