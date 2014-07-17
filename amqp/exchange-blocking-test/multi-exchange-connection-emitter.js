/**
 *
 *  Emits large messages to AMQP to see whether or not they block
 *  when they all publish to one exchange.
 *
 *  Unlike emitter.js, emits messages to different AMQP connections.
 *
 */

var amqp = require('amqp');
var fs = require('fs');

var data = (JSON.parse(fs.readFileSync('./data.json', 'utf8'))).message;

var EXCHANGE_NAME = 'test',
    ROUTING_KEY = 'route',
    NUM_MESSAGES = 20,
    NUM_EXCHANGES = 5;

var exchanges = [];

function getMessage() {
    // returns a message with a lot of data and the current time
    return {
        date: new Date().getTime(),
        stuff: data
    };
}

var connection = amqp.createConnection({ host: 'localhost' });

connection.on('ready', function onConnectionReady() {

    for (var i = 0; i < NUM_EXCHANGES; i++) {
        (function (i) {
            connection.exchange(EXCHANGE_NAME, {
                type: 'topic',
                autoDelete: false
            }, function (exchange) {
                exchanges.push(exchange);

                if (exchanges.length >= NUM_EXCHANGES) {
                    console.log("Done setting up exchanges.");

                    for (var j = 0; j < NUM_MESSAGES; j++) {
                        var exchangeIndex = j % NUM_EXCHANGES;

                        exchanges[j].publish(ROUTING_KEY, getMessage(), {
                            contentType: 'application/json'
                        });

                        console.log("Message published to exchange connection #" + exchangeIndex);
                    }
                }
            });
        })(i);
    }
});