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


### Tuning kernal 
```
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
kernel.sem = 250 32000 100 128
net.core.rmem_default = 262144
net.core.rmem_max = 8388608
net.core.wmem_default = 262144
net.core.wmem_max = 8388608
net.core.netdev_max_backlog = 8192
net.core.somaxconn = 8192
net.ipv4.ip_local_port_range = 1024 65000
net.ipv4.tcp_tw_reuse = 1
```

### Ephemeral Port Issue

[Ephemeral Ports](http://en.wikipedia.org/wiki/Ephemeral_port) range from port 49152 to 65535 (on OSX - this is the range suggested by IANA). That gives us 16,383 available ports. Each connected socket picks a different port in this range, causing us to hit this limit. We can make the limit a little bigger by decreasing the number the Ephemeral port starts at, but it only gives us so much. 

Add to sysctl: `sudo sysctl -w net.inet.ip.portrange.first=32768`

Also, edit sysctl.conf with this setting

We can also reduce the maximum segment lifetime (MSL) which affects the TIME_WAIT duration (used to prevent slow packets from connection A being accepted by a later, different connection). For us, this isn't relevant because each socket should remain connected.
