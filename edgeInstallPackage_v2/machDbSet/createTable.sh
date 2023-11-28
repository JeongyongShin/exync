#!/bin/bash

TABLE_SQL=/home/machbase/sharedVolume/createTable.sql
/home/machbase/machbase/bin/machsql -s 127.0.0.1 -u SYS -p MANAGER -f $TABLE_SQL
