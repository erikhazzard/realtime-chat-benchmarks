## amqp-rooms-messages

Tests broadcasting a message from a room to all subscribed clients also in the room. There are a maximum of 6 members in a room.

The client will send messages at staggered intervals. Only one client will be active in a room at any given time. The message sent will contain the room that the socket will broadcast to and the time that the message was sent. When all of the messages are received on the client, the difference in time is logged to a file.

Average time of all of the requests can be computed by running the `compute-average.js` script.

There's a chunk of logic that's done when messages are sent to/from the client/server (e.g. `JSON.stringify`, looking up values in a dictionary when a message is returned to determine when all messages are received).

The test aims to find out:

* How many rooms and clients can 1 server handle?

### Running the test

Start the server:
`node -max-old-space-size=8192 server-single-amqp-client-queue-broadcast