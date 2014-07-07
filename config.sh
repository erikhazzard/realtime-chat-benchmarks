#!/bin/bash

# Configures OS settings

sudo launchctl limit maxfiles 512 1000000
sudo sysctl -w kern.maxfilesperproc=1000000
sudo sysctl -w kern.maxfiles=1000000
ulimit -S -n 999999
sudo sysctl -w net.inet.ip.portrange.first=32768