## amqp-rooms-feed

Tests broadcasting a message from a room to all subscribed clients to mimic the real-time feed when something happens in one of the rooms that a user sees on his/her screen.

Each client is connected to 8 rooms. There are two tests available; one for when all clients are connected to the same 8 rooms and another for all clients are connected to random rooms. These tests use AMQP.

The test aims to find out:

* How long does it take to broadcast to all clients?
    * Average wait time per client
* How many clients can one room handle?