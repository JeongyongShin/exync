import os, time
from datetime import datetime
from influxdb_client import InfluxDBClient, Point, WriteOptions
from influxdb_client.client.write_api import SYNCHRONOUS
import psutil  # Import psutil to get system information

# InfluxDB 정보 설정
INFLUX_URL = 'http://192.168.0.4:8086'
INFLUX_TOKEN = os.environ['TSDB_TOKEN']
INFLUX_ORG = os.environ['TSDB_ORG']
INFLUX_BUCKET = os.environ['TSDB_BUCKET']

# InfluxDB 클라이언트 생성
client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN)
write_api = client.write_api(write_options=WriteOptions(batch_size=1, flush_interval=10_000))

# Continuous loop to write data
try:
    while True:
        # Get system metrics
        cpu_usage = psutil.cpu_percent(interval=1)
        mem_usage = psutil.virtual_memory().percent
        disk_usage = psutil.disk_usage('/').percent  # You may need to change the disk path accordingly

        # 데이터 포인트 정의
        point = Point("system").tag("host", "jy-desktop") \
            .field("cpu_usage", cpu_usage) \
            .field("mem_usage", mem_usage) \
            .field("disk_usage", disk_usage) \
            .time(datetime.utcnow())

        # 데이터 쓰기
        write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)
        time.sleep(1)
        print('cpu usage: ', cpu_usage, ', mem_usage :', mem_usage, ', disk_usage : ', disk_usage)

finally:
    # 클라이언트 종료
    client.close()
    write_api.close()
