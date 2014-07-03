# Realtime Chat Server Utilities / Benchmarks

[ Add instructions ]

## Configuring System Settings - OSX

* edit `sudo vim /etc/launchd.conf` and add: `limit maxfiles 512 unlimited`
* Run: `echo 'kern.maxfiles=20480' | sudo tee -a /etc/sysctl.conf`
* Run: `sudo sysctl -w kern.maxfilesperproc=1000000`
* Run: `sudo sysctl -w kern.maxfiles=1000000`

* Edit /etc/sysctl.conf and add:

        net.ipv4.tcp_rmem = 4096 87380 8388608
        net.ipv4.tcp_wmem = 4096 87380 8388608
        kern.maxfiles=90480 
        kern.maxfilesperproc=98576

* Update the ulimit: `ulimit -S -n 999999`  NOTE: Also, add this to your ~/.profile


## Note - Original Settings
kern.stack_size: 16384
kern.nbuf: 16384
kern.msgbuf: 16384
kern.maxnbuf: 16384
kern.maxnbuf: 16384
