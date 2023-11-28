#!/bin/bash


# InfluxData 저장소 추가
echo "deb https://repos.influxdata.com/ubuntu `lsb_release -sc` stable" | tee /etc/apt/sources.list.d/influxdb.list
curl -sL https://repos.influxdata.com/influxdb.key | sudo apt-key add -

# 패키지 인덱스 업데이트
sudo apt update

# InfluxDB 2.x 및 CLI 설치
sudo apt install -y influxdb2 influxdb2-cli

# InfluxDB 서비스 활성화 및 시작
sudo systemctl enable --now influxdb

# InfluxDB 버전 확인
influxd version
