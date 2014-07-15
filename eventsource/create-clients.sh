#!/usr/bin/bash

echo "Hello"

max=$1

echo "Iterations: $1"


for i in $(seq 1 $max)
do
  echo "$i"
  node ./express/client-simple.js > log.log &
done 

