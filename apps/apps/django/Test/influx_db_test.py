import os
from datetime import datetime
from influxdb_client import InfluxDBClient, Point, QueryApi
from influxdb_client.client.write_api import SYNCHRONOUS

# InfluxDB 정보 설정
INFLUX_URL = 'http://192.168.0.4:8086'
INFLUX_TOKEN = os.environ['TSDB_TOKEN']
INFLUX_ORG = os.environ['TSDB_ORG']
INFLUX_BUCKET = os.environ['TSDB_BUCKET']

print('INFLUX_TOKEN : ', INFLUX_TOKEN)
print('INFLUX_ORG : ', INFLUX_ORG)
print('INFLUX_BUCKET : ', INFLUX_BUCKET)

# InfluxDB 클라이언트 생성
client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN)
print('client created')

# 데이터 포인트 정의
point = Point("temperature").tag("location", "room").field("value", 27.0).time(datetime.utcnow())
print('point created')

# 데이터 쓰기
with client.write_api(write_options=SYNCHRONOUS) as write_api:
    write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)

# 데이터 읽기
query_api = client.query_api()
query = f'from(bucket: \"{INFLUX_BUCKET}\") |> range(start: -1h) |> filter(fn: (r) => r._measurement == "temperature")'
result = query_api.query(org=INFLUX_ORG, query=query)

# 결과 출력
for table in result:
    for record in table.records:
        print(f'Time: {record.get_time()}, Value: {record.get_value()}')

# 클라이언트 종료
client.close()
