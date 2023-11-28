#!/bin/bash
kill -9 `ps -aux | grep [g]atewayWeb.py | awk '{print $2}'`
