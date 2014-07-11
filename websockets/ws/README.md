# WebSockets - ws

### Ideas/things to test
* Test random join & leave and message receiving
* Authorize Functionalitty
* 20.000 concurrent connections (simulating chat rooms)
* Feed simulation: 10k,20k connected clients total time to propagate one message to everyone
 * Total time
 * Avg time

### Setup

There are many different types of benchmarks available to be run. First run a server file with `node -max-old-space-size=8192 server-*.js` then some client script with `node -max-old-space-size=8192 client-*.js`.

## Test Machines
  * Machine: roundrobin
    * Mac Book Pro 13"
    * 2.GHz Intel Core i7
    * 16GB 1333MHz DDR

  * Machine: denniszhao
    * Macbook Air 13"
    * 1.3 GHz Intel Core i5
    * 8GB 1600MHz DDR3


#### Tests
* Broadcast: send a message to all connected clients
* Create clients: create and connect 20k clients
* Room broadcast: send a message to all connected clients in the room
    * Results should be compared with RabbitMQ, ZeroMQ, etc.
* Feed: Creates a bunch of rooms and broadcasts messages from a socket to all of the connected clients in the room. Similar to room broadcast but with less clients and switching off between rooms.


### Results

| Test           | Machine    | Number Clients | Time delays     | Time in seconds |
|----------------|------------|----------------|-----------------|                 |
| Broadcast      | denniszhao | 20000          | 300ms           | 2.5s            |
| Room broadcast | denniszhao | 20000          | 300ms           | 5-10ms          |
| Room broadcast | denniszhao | 20000          | 10ms between concurrent senders | 412.16ms (average) |
| Feed           | denniszhao | 20000          | 2s              | 568.41ms (avg)  |

Note: Benchmarks could probably be improved by reducing logging and improving the code.