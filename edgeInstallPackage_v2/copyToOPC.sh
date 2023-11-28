echo "usage : ./copy.sh [FILENAME]"
RESULT=$(docker cp ./$1 opcuaModule:/)
if [ -e $1 ] && [ ${#1} -gt 0 ]
then
	echo "file successfully copied : ./$1 ==> opcuaModule:/workspace/aggr/build/config/$1"
else
	echo "there is no such file... please check it"
fi

