#!/bin/sh

#BACKUP_PATH=/home/machbase/sharedVolume/dbBackup
BACKUP_PATH=/home/machbase/sharedVolume/usbDisk/dbBackup
BACKUP_SQL=/home/machbase/sharedVolume/backup.sql
BACKUP_LOG=/home/machbase/sharedVolume/dbBackup.log

LAST_BACKUP_NOTE=/home/machbase/sharedVolume/lastBackup.txt

BU_DATE_DAY=$(date '+%d')
#BU_DATE_DAY=$(date '+%M')
#BU_DATE_DAY=$(date '+%H')

#BU_DATE_DAY_LAST=$(date -d '1 day ago' '+%d')
#BU_DATE_DAY_LAST=$(date -d '1 minute ago' '+%M')
#BU_DATE_DAY_LAST=$(date -d '1 hour ago' '+%H')
BU_DATE=$(date '+%Y-%m-%d %H:%M:%S')


if [ -d "/home/machbase/sharedVolume/usbDisk/oldBackup" ]
then
	rm -rf /home/machbase/sharedVolume/usbDisk/oldBackup/*
fi

mkdir -p /home/machbase/sharedVolume/usbDisk/oldBackup
chown -R machbase:machbase /home/machbase/sharedVolume/usbDisk/oldBackup

if ls -l $BACKUP_PATH>/dev/null 2>&1
then
mv $BACKUP_PATH/* /home/machbase/sharedVolume/usbDisk/oldBackup
fi

if [ -e "$LAST_BACKUP_NOTE" ]
then
chown -R machbase:machbase $LAST_BACKUP_NOTE
rm $LAST_BACKUP_NOTE
fi

rm -rf $BACKUP_PATH/*

mkdir -p $BACKUP_PATH
chown -R machbase:machbase $BACKUP_PATH

echo "======== Backup UTC $BU_DATE ==============" >> $BACKUP_LOG
#echo "BACKUP DATABASE INTO DISK ='$BACKUP_PATH/tsDbFullBackup_$BU_DATE_DAY'"> $BACKUP_SQL
echo "BACKUP DATABASE INTO DISK ='$BACKUP_PATH/tsDbFullBackup'"> $BACKUP_SQL

/home/machbase/machbase/bin/machsql -s 127.0.0.1 -u SYS -p MANAGER -f $BACKUP_SQL >> $BACKUP_LOG
#mkdir $BACKUP_PATH/tsDbFullBackup_$BU_DATE_DAY
#mkdir $BACKUP_PATH/tsDbFullBackup


#echo "tsDbFullBackup_$BU_DATE_DAY">$LAST_BACKUP_NOTE
echo "tsDbFullBackup">$LAST_BACKUP_NOTE
