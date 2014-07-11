/**
 *
 *  sever-single-broadcast-back
 *
 *  Broadcasts all received messages to all connected clients and logs the
 *  time to see how long it takes for a message to propagate from one
 *  client to all clients
 *
 */

require("http").globalAgent.maxSockets = Infinity;
var WebSocketServer = require('ws').Server,
    wsServer = new WebSocketServer({ port: 3000 });
var colors = require('colors');
var winston = require('winston');
var async = require('async');
var _ = require('lodash');
var logMemUsage = require('../../util/mem-usage');

var LOG_FILE_PATH = 'logs/clients-messages-single.log';

var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.File) ({
            filename: LOG_FILE_PATH,
            level: 'verbose'
        })
    ]
});

console.log("\t\t\tWS Server starting".bold.blue);
console.log("========================================================");

logMemUsage(1500);

var numCloses = 0,
    numErrors = 0;

// Add a broadcast function to the server
wsServer.broadcast = function(data) {
    // Sends data to all clients
    var numClients = this.clients.length;
    console.log("Broadcasting " + data + " to " + numClients + " clients.");

    for (var i in this.clients) {
        this.clients[i].send(data);
    }

    console.log("Finished broadcasting " + data + " to " + numClients + " clients.");
};

wsServer.on('connection', function setupSocket(ws) {
    // When a client connects, increase the # of connectionsand set up the
    // socket for use, binding a bunch of events etc.
    var numClients = this.clients.length;

    if (numClients % 500 === 0) {
        console.log(("Client connected! : ".bold + numClients).green);
    }

    ws.on('message', function (message) {
        // When a message is received, first log the time for benchmarking
        // and then broadcast the message to all clients
        console.log(("Received message: " + message).blue);

        // Log message to file before broadcast call
        logger.verbose("Broadcasting message: " + message, {
            message: message,
            time: new Date().getTime()
        });

        wsServer.broadcast(message);
    });

    ws.on('close', function() {
        numCloses++;
        console.log(('Client closed; total number of closes: ' + numCloses).bold.red);
        ws.close();
    });

    ws.on('error', function(e) {
        numErrors++;
        console.log(("Total number of errors: " + numErrors).bold.red);
        console.log(('Client #%d error: %s', thisId, e.message).bold.red);
    });
});