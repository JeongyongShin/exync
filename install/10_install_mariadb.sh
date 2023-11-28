#!/bin/bash

# MariaDB의 GPG 키를 추가합니다.
sudo apt-key adv --fetch-keys 'https://mariadb.org/mariadb_release_signing_key.asc'

# MariaDB 저장소를 시스템의 소스 리스트에 추가합니다.
# tee 명령에 sudo를 적용합니다.
sudo tee /etc/apt/sources.list.d/mariadb.list << EOF
deb [arch=amd64,arm64,ppc64el] https://ftp.harukasan.org/mariadb/repo/10.5/ubuntu bionic main
EOF

# 패키지 리스트를 업데이트합니다.
sudo apt-get update

# MariaDB 서버를 설치합니다.
sudo apt-get -y install mariadb-server
