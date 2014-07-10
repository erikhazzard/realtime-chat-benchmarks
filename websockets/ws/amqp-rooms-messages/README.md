## amqp-rooms-messages

Tests broadcasting a message from a room to all subscribed clients also in the room. There are a maximum of 6 members in a room.

The client will send messages at staggered intervals. Only one client will be active in a room at any given time.

The test aims to find out:

* How many rooms and clients can 1 server handle?

### Running the test

Start the server:
`node -max-old-space-size=8192 server-single-amqp-client-queue-broadcast