 #!/bin/bash          
lastDate=$(tail -n1 ./logs/logs.log|cut -f3 -d$'\t')
firstDate=$(head -n1 ./logs/logs.log|cut -f3 -d$'\t')
 
echo $firstDate
echo $lastDate

timeInMs=$(expr $lastDate - $firstDate )

echo "Broadcasting messages took $(awk -v ms=${timeInMs} 'BEGIN{print ms / 1000}') seconds"

