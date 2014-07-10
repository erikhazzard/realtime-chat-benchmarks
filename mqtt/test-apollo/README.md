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
$ cd /var/lib
$ sudo $PATH_TO_YOUR_APOLLO/bin/apollo create someBrokerName
# Start Broker
$ cd /var/lib/someBrokerName/bin
# Starts a JVM app
$ sudo ./apollo-broker run

# Logging Client connections
# In a new shell
$ cd /var/lib/someBrokerName/log
$ tail -f apollo.log 


# In a new shell
# Logging Client connections
$ cd /var/lib/someBrokerName/log
$ tail -f connection.log

```

  