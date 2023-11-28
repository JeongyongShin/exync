#!/bin/bash

#BACKUP_PATH=/home/machbase/sharedVolume/dbBackup
BACKUP_PATH=/home/machbase/sharedVolume/usbDisk/dbBackup
BACKUP_SQL=/home/machbase/sharedVolume/backup.sql
BACKUP_LOG=/home/machbase/sharedVolume/dbBackup.log
LAST_BACKUP_NOTE=/home/machbase/sharedVolume/lastBackup.txt
#LAST_BACKUP=cat $LAST_BACKUP_NOTE
#LAST_BACKUP=cat /home/machbase/sharedVolume/lastBackup.txt
LAST_BACKUP=$(</home/machbase/sharedVolume/lastBackup.txt)

BU_DATE=$(date '+%Y-%m-%d %H:%M:%S')
#BU_DATE_DAY_LAST=$(date -d '1 day ago' '+%d')
#BU_DATE_DAY_LAST=$(date -d '1 minute ago' '+%M')
#BU_DATE_DAY_LAST=$(date -d '1 hour ago' '+%H')

BU_DATE_DAY=$(date '+%d')
#BU_DATE_DAY=$(date '+%H')
#BU_DATE_DAY=$(date '+%M')


if [ -d "$BACKUP_PATH/tsDbFullBackup" ]
then

echo "======== Backup UTC $BU_DATE ==============" >> $BACKUP_LOG
#echo "BACKUP DATABASE AFTER '$BACKUP_PATH/tsDbFullBackup_$BU_DATE_DAY_LAST' INTO DISK ='$BACKUP_PATH/tsDbIncBackup_$BU_DATE_DAY'"> $BACKUP_SQL
#echo "BACKUP DATABASE AFTER '$BACKUP_PATH/tsDbIncBackup_$BU_DATE_DAY_LAST' INTO DISK ='$BACKUP_PATH/tsDbIncBackup_$BU_DATE_DAY'"> $BACKUP_SQL
echo "BACKUP DATABASE AFTER '$BACKUP_PATH/$LAST_BACKUP' INTO DISK ='$BACKUP_PATH/tsDbIncBackup_$BU_DATE_DAY'"> $BACKUP_SQL

/home/machbase/machbase/bin/machsql -s 127.0.0.1 -u SYS -p MANAGER -f $BACKUP_SQL >> $BACKUP_LOG
#mkdir $BACKUP_PATH/tsDbIncBackup_test_$BU_DATE_DAY

chown -R machbase:machbase $LAST_BACKUP_NOTE
echo "tsDbIncBackup_$BU_DATE_DAY">$LAST_BACKUP_NOTE

fi
