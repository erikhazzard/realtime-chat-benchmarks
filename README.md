# Realtime Chat Server Utilities / Benchmarks

[ Add instructions ]

## Configuring System Settings - OSX

1. Update the ulimit: `ulimit -n 12288`
2. edit `sudo vim /etc/launchd.conf` and add: `limit maxfiles 512 unlimited`
3. Run: `echo 'kern.maxfiles=20480' | sudo tee -a /etc/sysctl.conf`
