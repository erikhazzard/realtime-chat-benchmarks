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
var async = require('async');
var _ = require('lodash');

var fileContents = fs.readFileSync('./data.json', 'utf8');
var data = JSON.parse(fileContents).message;

// var connectionPool = require('../util/exchangeConnectionPool');

var EXCHANGE_NAME = 'test',
    ROUTING_KEY = 'route',
    NUM_MESSAGES = 100,
    NUM_EXCHANGES = 10;

var exchanges = [];

function getMessage() {
    // returns a message with a lot of data and the current time
    return {
        date: new Date().getTime(),
        stuff: data + ("x" * (Math.floor(Math.random() * 20)))
    };
}

var connection = amqp.createConnection({ host: 'localhost' });

connection.on('ready', function onConnectionReady() {

    async.each(_.range(NUM_EXCHANGES), function(i, cb) {
        // Use async here to control when the next exchange is set up because
        // otherwise we run into the issue where the 'ready' callback is
        // fired a bunch of times
        // See: https://github.com/postwait/node-amqp/issues/255
        console.log("Setting up exchange #" + i + "...");
        connection.exchange(EXCHANGE_NAME, {
            type: 'topic',
            autoDelete: false
        }, function doneSetupExchange(exchange) {
            exchanges.push(exchange);

            console.log("Done setting up exchange #" + i);
            cb();
        });
    }, function doneSetupExchanges() {
        for (var j = 0; j < NUM_MESSAGES; j++) {
            var exchangeIndex = j % NUM_EXCHANGES;

            exchanges[exchangeIndex].publish(ROUTING_KEY,
                getMessage(), {
                contentType: 'application/json'
            });

            console.log("Message published to exchange connection #" + exchangeIndex);
        }

        process.exit(1);
    });
});