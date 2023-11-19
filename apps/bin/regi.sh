#!/bin/bash

/opt/bin/regi -c stop 1> /dev/null 2> /dev/null
sleep 1
/bin/rm -f /var/run/regi.pid
/opt/bin/regi 1> /dev/null 2> /dev/null
