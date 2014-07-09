# MQTT


### Ideas
* Test random join & leave and message receiving
* Authorize Functionalitty
* 20.000 concurrent connections (simulating chat rooms)
* Feed simulation: 10k,20k connected clients total time to propagate one message to everyone
 * Total time
 * Avg time

* ZeroMq backend
* Rountrip time for all message of a room (6 people)
* Test: Check the with Rabittmq + Mqtt setup throughput
* ZeroMq: Throughput 60k-70k

## Test setup
  * Mac Book Pro 13"
  * 2.GHz Intel Core i7
  * 16GB 1333MHz DDR


## Commands to start Moquitto
   ```bash
    #Start server
    $ mosquitto -p 1111    
  
    #Call Publisher
    $ mosquitto_pub -t "topic_xyz" -m "Hello World!" 
  
    #Start Subscriber
    $ mosquitto_sub -t "topic_xyz" -v
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

### People of Interest: 
  * Andy Piper




