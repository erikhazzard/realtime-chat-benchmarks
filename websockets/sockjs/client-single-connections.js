/**
 *
 *  client-single-connections
 *
 *  Creates a lot of connections.
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
var NUM_CONNECTIONS = 20000,
    socketUri = "http://localhost:9999/test",
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
});