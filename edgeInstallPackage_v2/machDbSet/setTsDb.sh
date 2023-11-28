#!/bin/bash

cp ./createTable.sh /home/admin/sharedFolder/
cp ./createTable.sql /home/admin/sharedFolder/
sudo docker exec -t tsDB sudo /home/machbase/sharedVolume/createTable.sh &

sleep 10

sudo docker cp ./MWA.conf tsDB:/home/machbase/machbase/webadmin/flask/MWA.conf
cp ./restartMWA.sh /home/admin/sharedFolder/
sudo docker exec -t tsDB sudo /home/machbase/sharedVolume/restartMWA.sh &

