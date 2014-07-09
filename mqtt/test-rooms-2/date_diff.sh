 #!/bin/bash          
lastDate=$(tail -n1 ./logs/logs.log|cut -f3 -d$'\t')
firstDate=$(head -n1 ./logs/logs.log|cut -f3 -d$'\t')
 
#echo $firstDate
#echo $lastDate

timeInMs=$(expr $lastDate - $firstDate)
timeInSec=$(expr $timeInMs / 100)

echo "Broadcasting messages took $timeInMs ms"

