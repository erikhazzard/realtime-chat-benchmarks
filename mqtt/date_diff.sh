 #!/bin/bash          
echo "Starting script"

echo $(which cut)

lastDate=$(tail -n1 ./logs/client-profiling.log|cut -f3 -d$'\t')
firstDate=$(head -n1 ./logs/client-profiling.log|cut -f3 -d$'\t')
 
echo $firstDate
echo $lastDate

timeInMs=$(expr $lastDate - $firstDate)
timeInSec=$(expr $timeInMs / 100)

echo "Broadcasting messages $timeInMs took ms"

