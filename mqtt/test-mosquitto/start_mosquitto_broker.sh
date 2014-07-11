#mosquitto -p 1111 &
#MOS_PID=$!

echo "Started mosquitto $MOS_PID"

echo "Number of clients to be created $1"


declare -a clients

for i in `seq 1 $1`;
do
  mosquitto_sub -t "topic_xyz" -v &
  mos_pid=$!
  clients[$i]=$mos_pid

  echo "${clients[$i]}"

done  


sleep 2
pkill mosquitto_sub
#kill $MOS_PID
