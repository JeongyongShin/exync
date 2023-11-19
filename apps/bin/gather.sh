#!/bin/bash

/opt/bin/gather -c stop 1> /dev/null 2> /dev/null
sleep 1
/bin/rm -f /var/run/gather.pid
/opt/bin/gather 1> /dev/null 2> /dev/null
