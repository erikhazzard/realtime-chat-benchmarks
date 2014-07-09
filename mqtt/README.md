# MQTT

Notes...

### Test Setup A: Server + x Rooms a 5 people + 

* Test random join & leave and message receiving
* Authorize Functionalitty in 

## Test setup
  * Mac Book Pro 13"
  * 2.GHz Intel Core i7
  * 16GB 1333MHz DDR


## Commands to start Moquitto
   ```bash
    #Start server
    mosquitto -p 1111    
  

    #Call Publisher
    mosquitto_pub -t "topic_xyz" -m "Hello World!" 
  
    #Start Subscriber
    mosquitto_sub -t "topic_xyz" -v
   ```

### Setup 1:  1 Server, 1000 Clients, Broadscast script

   ```bash
    # Start server
    $ cd test-rooms-1
    $ node server-profiling.js
  
    # In a new window
    # Create x nr of rooms & add 5 clients to each room
    # x can be passed in a CLI argument (ex: 1000)
    $ node client-profiling.js 1000

    # In a new window
    # Add a client to each room & broadcast messages to all members of the room
    $ node broadcast-messages.js

   ```

### Setup 1: 1 Server, 1000 Clients, Logs results

   ```bash
    # Start server
    $ cd test-rooms-2
    $ node server-profiling.js
  
    # In a new window
    # Create x nr of rooms. x can be passed in a CLI argument (ex: 20000)
    $ node client-profiling.js 20000

    # In a new window
    $ sh date_diff.sh
    
   ```


   


- Benchmark for Ampq
  - Scaling Amqp it self
   -> Rabbitmq or ZeroMq
- Mqtt
 - if we know that we can handl e x (ex. 20.000)

- 20.000 concurrent connections (simulating chat rooms)
  ->


  Chat:

  Feed:

  RabbitMq
  Redis
  Mosca
  Mosquitto
  ZeroMq

## Things to test
-> Rountrip time for all message of a room (6 people)


* Feed simulation: 10k,20k connected clients total time to propagate one message to everyone
 * Total time
 * Avg time

* ZeroMq backend

Test: Check the with Rabittmq + Mqtt setup throughput
->ZeroMq: Throughput 60k-70k

### People of Interest: 
  * Andy Piper




