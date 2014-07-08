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

logMemUsage(1500);

    // Number of connections to create
var NUM_CONNECTIONS = 5000,
    // Number of clients to be concurrently sending out messages
    NUM_CONCURRENT_SENDERS = 10,
    socketUri = "http://localhost:9999/echo",
    // array of clients
    clients = [];

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
                clients[index].write("Hello from client #" + index);

                index = (index + 1) % clients.length;
            }, 30);
        }, 77 * i);
    }
});