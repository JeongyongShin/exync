#!/bin/bash

# Lynis를 클론합니다.
git clone https://github.com/CISOfy/lynis

# 클론한 디렉토리로 이동합니다.
cd lynis

# 스캔을 실행합니다. 루트 권한이 필요할 수 있습니다.
sudo ./lynis audit system
