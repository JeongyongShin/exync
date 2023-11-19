#!/bin/bash

/opt/bin/itsdb -c stop 1> /dev/null 2> /dev/null
sleep 1
/bin/rm -f /var/run/itsdb.pid
/opt/bin/itsdb 1> /dev/null 2> /dev/null
