# MQTT

Notes...

### Test Setup A: Server + x Rooms a 5 people + 

* Test random join & leave and message receiving
* Authorize Functionalitty in 


## Commands to start Moquitto
   ```bash
    #Start server
    mosquitto -p 1111    
  

    #Call Publisher
    mosquitto_pub -t "topic_xyz" -m "Hello World!" 
  
    #Start Subscriber
    mosquitto_sub -t "topic_xyz" -v
   ```

## Setup 1:  X nr of rooms a 6 people
   ```bash
    # Start server
    cd test-rooms-1
    node server-profiling.js
  
    # In a new window
    # Spawn clients
    node client-profiling.js

    # In a new window
    # Add a client to each room & broadcast messages to all members of the room
    node broadcast-messages.js

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




