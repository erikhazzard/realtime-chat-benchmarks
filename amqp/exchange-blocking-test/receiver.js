/**
 *
 *  Subscribes to the AMQP exchange and logs the differences in times. An
 *  increase in time between messages signifies that blocking does occur
 *  on RabbitMQ's side.
 *
 *
 */

var amqp = require('amqp');

var EXCHANGE_NAME = 'test',
    ROUTING_KEY = 'route';

var numMessagesReceived = 0,
    lastMessageReceivedTime;

var connection = amqp.createConnection({ host: 'localhost' });

connection.on('ready', function onConnectionReady() {

    connection.exchange(EXCHANGE_NAME, {
        type: 'topic',
        autoDelete: false
    }, function (exchange) {
        connection.queue('room', function (queue) {
            queue.bind(EXCHANGE_NAME, '#');

            console.log("Waiting for messages on: #");

            queue.subscribe(function onMessageReceived(message) {
                numMessagesReceived++;
                console.log("Message received... total: " + numMessagesReceived);

                var timeDiff = new Date().getTime() - message.date;

                console.log("Received message. Time difference: " + timeDiff);
            });
        });
    });
});
