#!/bin/bash

git clone https://github.com/alanxz/rabbitmq-c.git
cd rabbitmq-c
mkdir build
cd build
cmake ..
make clean
make install
