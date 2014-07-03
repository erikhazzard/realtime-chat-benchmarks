# Realtime Chat Server Utilities / Benchmarks

[ Add instructions ]

## Configuring System Settings - OSX

1. Update the ulimit: `ulimit -S -n 999999`  NOTE: Also, add this to your ~/.profile
2. edit `sudo vim /etc/launchd.conf` and add: `limit maxfiles 512 unlimited`
3. Run: `echo 'kern.maxfiles=20480' | sudo tee -a /etc/sysctl.conf`

4. Edit /etc/sysctl.conf and add:

        net.ipv4.tcp_rmem = 4096 87380 8388608
        net.ipv4.tcp_wmem = 4096 87380 8388608
