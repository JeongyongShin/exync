#!/bin/sh

cp ./service/* /lib/systemd/system
systemctl daemon-reload
