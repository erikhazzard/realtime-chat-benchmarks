/**
 *
 *  Emits large messages to AMQP to see whether or not they block
 *  when they all publish to one exchange.
 *
 */

var amqp = require('amqp');
var fs = require('fs');

var data = (JSON.parse(fs.readFileSync('./data.json', 'utf8'))).message;

var EXCHANGE_NAME = 'test',
    ROUTING_KEY = 'route',
    NUM_MESSAGES = 100;

function getMessage() {
    return {
        date: new Date().getTime(),
        stuff: data
    };
}

var connection = amqp.createConnection({ host: 'localhost' });

connection.on('ready', function onConnectionReady() {

    connection.exchange(EXCHANGE_NAME, {
        type: 'topic',
        autoDelete: false
    }, function (exchange) {

        for (var i = 0; i < NUM_MESSAGES; i++) {
            exchange.publish(ROUTING_KEY, getMessage(), {
                contentType: 'application/json'
            });

            console.log("Sent out message #" + i);
        }

        exchange.publish(ROUTING_KEY, {
            message: "hey",
            date: new Date().getTime()
        }, {
            contentType: 'application/json'
        });
    });
});