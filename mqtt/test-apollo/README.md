# ActiveMQ Apollo (1.7)

## Facts
  * Supports MQTT, AMPQ, STOMP
  * Written in Scala



## Install on Mac

```bash
$ brew install apollo
```

## Create Broker
```bash
# 1. Create a broker
$ cd /var/lib
$ sudo $PATH_TO_YOUR_APOLLO/bin/apollo create someBrokerName

# 2. Start Broker
$ cd /var/lib/someBrokerName/bin
# Starts a JVM app
$ sudo ./apollo-broker run

# 3. Logging apollo (In a new shell)
$ cd /var/lib/someBrokerName/log
$ tail -f apollo.log 

# 4. Logging Client connections (In a new shell)
$ cd /var/lib/someBrokerName/log
$ tail -f connection.log

```

## Connecting to Broker
```bash
# 1. Connect to Broker & pass in number of clients (ex: 1000)
$ node client_receiver.js 1000
```

  