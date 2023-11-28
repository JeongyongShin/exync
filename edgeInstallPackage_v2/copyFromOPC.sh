#/bin/bash
date=$(date "+%Y%m%d_%H%M%S")
mkdir $date
cd $date
docker container cp opcuaModule:/workspace/aggr/build/config/engineering.csv ./
docker container cp opcuaModule:/workspace/aggr/build/config/syscfg.json ./
docker container cp opcuaModule:/workspace/aggr/build/config/nodeset.xml ./

echo "cfg file copied : opcuaModule:~/workspace/aggr/build/config/[syscfg.json , nodeset.xml , enginnering.csv] ===> $date directory"
