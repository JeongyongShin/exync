#!/bin/bash

find "/opt/log" -name "*.log" -ctime +30 -delete
