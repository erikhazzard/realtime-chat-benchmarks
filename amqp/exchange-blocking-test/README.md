### Exchange blocking test

Aims to see whether or not sending a large message (>10 MB) over AMQP blocks the queue and prevents other messages from being sent over the queue.

We now know that sending a large message to RabbitMQ is bottlenecked not by RabbitMQ but by Node. Sending a large message will 'block' the node process for an amount of time that scales with the total number of messages being sent (e.g. ~2s for 15 messages, ~15s for 100 messages). I think this has to do with how the messages are being published without waiting for the previous message to actually be published to the exchange.

For example:
```
Waiting for messages on: #
Message received... total: 1
Received message. Time difference: 224
Message received... total: 2
Received message. Time difference: 1810
Message received... total: 3
Received message. Time difference: 1837
Message received... total: 4
Received message. Time difference: 1915
Message received... total: 5
Received message. Time difference: 1940
Message received... total: 6
Received message. Time difference: 1992
Message received... total: 7
Received message. Time difference: 2069
Message received... total: 8
Received message. Time difference: 2145
Message received... total: 9
Received message. Time difference: 2198
Message received... total: 10
Received message. Time difference: 2261
Message received... total: 11
Received message. Time difference: 2321
Message received... total: 12
Received message. Time difference: 2420
Message received... total: 13
Received message. Time difference: 2484
Message received... total: 14
Received message. Time difference: 2543
Message received... total: 15
Received message. Time difference: 2596
```

We know that using `async` to only publish a message after the last one has been succesfully published (set the `confirm` option to `true` when creating the exchange for the callback to be fired) will result in much better response times (however we can't necessarily guarantee that a message would wait until the one before has been published to be published):

```
Waiting for messages on: #
Message received... total: 1
Received message. Time difference: 232
Message received... total: 2
Received message. Time difference: 264
Message received... total: 3
Received message. Time difference: 369
Message received... total: 4
Received message. Time difference: 465
Message received... total: 5
Received message. Time difference: 560
Message received... total: 6
Received message. Time difference: 633
Message received... total: 7
Received message. Time difference: 744
Message received... total: 8
Received message. Time difference: 764
Message received... total: 9
Received message. Time difference: 868
Message received... total: 10
Received message. Time difference: 938
Message received... total: 11
Received message. Time difference: 944
Message received... total: 12
Received message. Time difference: 951
Message received... total: 13
Received message. Time difference: 961
Message received... total: 14
Received message. Time difference: 983
Message received... total: 15
Received message. Time difference: 994
```

multi-exchange-connection-emitter.js attempts to alleviate the delay by first connecting a number of exchanges and then publishing messages to different exchanges but this had no effect on the initial time delay (hence my suspicion that the bottleneck is node and not RabbitMQ).

Clustering the emitter script helps to reduce the time delay for a total number of messages emitted, but the delay is a little longer for the same number of messages per process. For example, the delay for 15 messages from one cluster is ~2s and is around the time it takes for 15 messages to be received from any single process. However, the delay is *per process* so 15 * numCPUs messages are actually sent in a similar amount of time.

Clustering the emitter script *and* using `async`'s `eachSeries` actually slows receiving messages.

With `eachSeries`:

60 messages total, clustered: 7986ms
60 messages total, non-clustered: 3405ms

Using just a for loop:

60 messages total, clustered: 8358ms
60 messages total, non-clustered: 10005ms