 #!/bin/bash          
lastDate=$(tail -n1 ./logs/logs.log|cut -f3 -d$'\t')
firstDate=$(head -n1 ./logs/logs.log|cut -f3 -d$'\t')
 
stream1=""


while read p; do
  
  lineClient=$(echo "$p"|cut -f3 -d$'\t')
  stream1+="$lineClient\n"
  
  
done <./logs/logs.log


echo $stream1| awk 'NR == 1 { max=$1; min=$1; sum=0 }
   { if ($1>max) max=$1; if ($1<min) min=$1; sum+=$1;}
   END {printf "Min: %d\tMax: %d\tAverage: %f\n ms", min, max, sum/NR}'

