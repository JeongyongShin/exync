#!/bin/bash
cd /home/machbase/machbase/webadmin/flask
sudo chown -R machbase:machbase MWA.conf
./MWAserver restart
