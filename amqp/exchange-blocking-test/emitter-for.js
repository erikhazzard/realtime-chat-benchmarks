/**
 *
 *  Emits large messages to AMQP to see whether or not they block
 *  when they all publish to one exchange.
 *
 *  Uses async to publish messages synchronously.
 *
 */

var amqp = require('amqp');
var fs = require('fs');
var _ = require('lodash');
var async = require('async');

var filename = './data.json'; // > 10 MB
var fileContents = fs.readFileSync(filename, 'utf8');
var data = (JSON.parse(fileContents)).message;

var EXCHANGE_NAME = 'test';
var ROUTING_KEY = 'route';
var NUM_MESSAGES = process.argv[2] || 60;

function getMessage() {
    // Returns a message with the current time and a lot of text
    return {
        date: new Date().getTime(),
        stuff: data
    };
}

var connection = amqp.createConnection({ host: 'localhost' });

connection.on('ready', function onConnectionReady() {

    connection.exchange(EXCHANGE_NAME, {
        type: 'topic',
        autoDelete: false,
        confirm: true // true for publish callback
    }, function (exchange) {

        for (var i = 0; i < NUM_MESSAGES; i++) {
            exchange.publish(ROUTING_KEY, getMessage(), {
                contentType: 'application/json'
            }, function onPublished() {
                console.log("Sent out message #" + i);
                // cb();
            });
        }

        console.log("Fired off " + NUM_MESSAGES + " publish calls.");
    });
});
