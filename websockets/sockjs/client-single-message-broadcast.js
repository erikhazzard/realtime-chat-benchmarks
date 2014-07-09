/**
 *
 *  client-single-message-broadcast
 *
 *  Creates a lot of connections and then sends one message to the server.
 *  Used mainly to calculate the time it takes for one message to be sent
 *  to all of the clients.
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
    numMessagesReceived = 0;
    //messages = {};

async.eachLimit(_.range(NUM_CONNECTIONS), NUM_CONNECTIONS / 20, function(i, cb) {
    var client = clients[i] = sjsc.create(socketUri);

    client.on('connection', function setupConnection() {
        console.log("Connected client #" + i);
        // Send a message
        setTimeout(function() {
            cb();
        }, 2500);
    });

    client.on('data', function(data) {
        // When a message is received, keep track of how many messages
        // have been received. When it's >= NUM_CONNECTIONS, we know that
        // all of the clients have received the broadcast
        // Since we're only broadcasting one message we don't actually
        // need to keep track of what the message was

        // console.log("Data received on client " + i + ": " + data);

        numMessagesReceived++;
        if (numMessagesReceived >= NUM_CONNECTIONS) {
            logger.verbose("Finished receiving " + data, {
                message: data,
                time: new Date().getTime()
            });
        }

        /*
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
        */
    });

    client.on('error', function(e) {
        console.log("Something went wrong...");
    });

}, function onFinishConnectingClients() {
    console.log("Done connecting " + NUM_CONNECTIONS + " connections.");

    var message = "test";

    clients[0].send(message);
    logger.verbose(message + " sent", {
        message: message,
        time: new Date().getTime()
    });
});
