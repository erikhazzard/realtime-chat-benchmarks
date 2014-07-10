/**
 *
 *  client-single-messages
 *
 *  Creates a lot of connections and then intermittently sends messages from
 *  a bunch of clients.
 *
 */

var async = require('async');
var sjsc = require('sockjs-client-ws');
var _ = require('lodash');
var winston = require('winston');
var logMemUsage = require('../../util/mem-usage');
var colors = require('colors');

var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.File) ({
            filename: 'logs/client-broadcast-back-single.log',
            level: 'verbose'
        })
    ]
});

logMemUsage(1500);

    // Number of connections to create
var NUM_CONNECTIONS = 20000,
    // Number of clients to be concurrently sending out messages
    NUM_CONCURRENT_SENDERS = 10,
    socketUri = "http://localhost:9999/test",
    // array of clients
    clients = [],
    messages = {};

async.eachLimit(_.range(NUM_CONNECTIONS), NUM_CONNECTIONS / 10, function(i, cb) {
    var client = clients[i] = sjsc.create(socketUri);

    client.on('connection', function setupConnection() {
        console.log("Connected client #" + i);
        // Send a message
        setTimeout(function() {
            cb();
        }, 300);
    });

    client.on('data', function(data) {
        console.log("Data received on client " + i + ": " + data);
        if (messages[data]) {
            messages[data] = messages[data] + 1;

            if (messages[data] >= NUM_CONNECTIONS) {
                logger.verbose("Finished receiving " + data + " at " +
                    (new Date()).getTime(), {
                    message: data,
                    time: new Date().getTime()
                });
            }
        } else {
            messages[data] = 1;
        }
    });

    client.on('error', function(e) {
        console.log("Something went wrong...");
    });

}, function onFinishConnectingClients() {
    console.log("Done connecting " + NUM_CONNECTIONS + " connections.");

    var index = 0;

    for (var i = 0; i < NUM_CONCURRENT_SENDERS; i++) {
        setTimeout(function() {
            setInterval(function() {
                clients[index].write(index);

                logger.verbose("Test #" + index + " sent", {
                    time: new Date().getTime(),
                    testNum: index
                });

                index = (index + 1) % clients.length;
            }, 300);
        }, 77 * i);
    }
});