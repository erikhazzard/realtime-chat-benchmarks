# MQTT
This folder contains a bunch of test and benchmarks to  MQTT

### Ideas
* Test random join & leave and message receiving
* Authorize Functionalitty
* 20.000 concurrent connections (simulating chat rooms)
* Feed simulation: 10k,20k connected clients total time to propagate one message to everyone
 * Total time
 * Avg time
 * Test other peoples servers!

* ZeroMq backend
* Rountrip time for all message of a room (6 people)
* Test: Check the with Rabittmq + Mqtt setup throughput
* ZeroMq: Throughput 60k-70k
* How to maintain session between server ();
* Keep alive settings

## Commands to start Moquitto
   ```bash
    #Start server
    $ mosquitto -p 1111

    #Call Publisher
    $ mosquitto_pub -t "topic_xyz" -m "Hello World!"

    #Start Subscriber
    $ mosquitto_sub -t "topic_xyz" -v
   ```

## Log
```
# Log and monitor the cpu usage of a process
$ watch -t -n 1 "ps -eo pcpu,args | sort -r -k1 |grep '[n]ode client-profiling' | cut -c1-4 | tee -a cpuAvg.log"log"

```

### Setup 1:  1 Server & x number of clients & broadcast script

   ```bash
    # Start server
    $ cd test-rooms-1
    $ node server-profiling.js

    # In a new window
    # Create x nr of clients
    # x can be passed in a CLI argument (ex: 1000)
    $ node client-profiling.js 1000

    # In a new window
    # Add a client to each room & broadcast messages to all members of the room
    $ node broadcast-messages.js

   ```

### Setup 2: 1 Server, x rooms / 6 people
This setup tests the time it takes to send one message to x clients, where clients are distrubuted in rooms a 6 people.

The **client-profiling.js** node.js script, creates these rooms and clients within the rooms
and sends after the initialization phase one message to each memeber of the room.

   ```bash
    # Start server
    $ cd test-rooms-2
    $ node server-profiling.js

    # In a new window
    # Create x nr of clients. x can be passed in a CLI argument (ex: 20000)
    # The script returns the time in ms it took to send all the messages
    $ node client-profiling.js 20000


   ```
## Test Machines
  * Machine: roundrobin
    * Mac Book Pro 13"
    * 2.GHz Intel Core i7
    * 16GB 1333MHz DDR

  * Machine: denniszhao
    * Macbook Air 13"
    * 1.3 GHz Intel Core i5
    * 8GB 1600MHz DDR3




## Results
### How long does it takes to connect clients?
| Type    | Test           | Machine    | Number Clients  | Time in seconds | Protocol|
|---------|----------------|------------|-----------------|-----------------|---------|
| Normal  | Create Clients | roundrobin |           5000  | 30.517s         | MQTT    |
| Cluster | Create Clients | roundrobin |           5000  | 3.355s          | MQTT    |
| Normal  | Create Clients | roundrobin |         10.000  | 72.065s         | MQTT    |
| Normal  | Create Clients | denniszhao |         20.000  | 65.008s         | WebSock |
| Normal  | Create Clients | roundrobin |         20.000  | 75.268s         | MQTT    |
| Normal  | Create Clients | roundrobin |         30.000  | 131.789s        | MQTT    |


### How long does it takes to send 1 message to x clients? (x rooms a 6 people)
| Type      | Test           | Machine    | Senders    | Clients  | Iterations | Avg Time | Total    |
|-----------|----------------|------------|------------|----------|------------| ---------|----------|
| Clustered | Send Message   | roundrobin | 1 per room |     5000 | 2          | 2.141 s  | 69.72 s  |
| Clustered | Send Message   | roundrobin | 1 per room |   10.000 | 2          | 2.287 s  | 136.36 s |
| Normal    | Send Message   | roundrobin | 1 per room |   30.000 | 2          | 8.277 s  | 403.04 s |
| Clustered | Send Message   | roundrobin | 1 per room |   30.000 | 2          | 8.277 s  | 403.04 s |

136.361 s



### People of Interest:
  * Andy Piper

### Sources

#### Native MQTT Clients
* http://www.hivemq.com/overview-of-mqtt-client-tools/
* http://www.banym.de/m2m/first-very-basic-mqtt-mac-app

#### Benchmarks

* http://www.infoq.com/news/2011/12/apollo-benchmarks
* http://qpid.apache.org/download.html
* http://blog.x-aeon.com/2013/04/10/a-quick-message-queue-benchmark-activemq-rabbitmq-hornetq-qpid-apollo/
* https://github.com/chirino/stomp-benchmark

#### Other

* http://stackoverflow.com/questions/10030227/maximize-throughput-with-rabbitmq
* https://news.ycombinator.com/item?id=5531192
* http://planet.jboss.org/post/8_2_million_messages_second_with_specjms
* https://github.com/mcollina/mosca
* https://github.com/mcollina/ascoltatori
* https://github.com/adamvr/MQTT.js

#### Apollo
* http://activemq.apache.org/apollo/documentation/getting-started.html

#### Load balance MQTT
* http://www.hivemq.com/building-a-high-availability-mqtt-cluster/

### Topics
* STOMP
* EventSource iOS?
* Websockets
* IBM WebShere MQ
* Amazon SQS
* Clustering
  * Discovery or fixed configured IP addresses of cluster members






