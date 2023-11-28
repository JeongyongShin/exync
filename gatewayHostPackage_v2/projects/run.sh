#export FLASK_APP=~/project/gatewayWeb_03.py
#export LANG=C.UTF-8
#export LC_ALL=C.UTF-8
#python3 -m flask run --host=0.0.0.0 --port=7000

nohup python3 gatewayWeb.py >> /home/admin/projects/gatewayWeb.log 2>&1 

