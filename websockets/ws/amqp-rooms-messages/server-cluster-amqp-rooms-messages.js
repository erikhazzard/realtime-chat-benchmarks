/**
 *
 *  server-single-amqp-rooms-messages
 *
 *  Non-clustered node server responsible for broadcasting any
 *  received messages back to the client and all other clients subscribed to
 *  that room by first communicating through AMQP
 *
 *  This constructs a queue for each client and publishes messages
 *  back through the queue because it's subscribed to a room's exchange
 *
 */

require("http").globalAgent.maxSockets = Infinity;
var colors = require('colors');
var winston = require('winston');
var async = require('async');
var _ = require('lodash');
var amqp = require('amqp');
var WebSocketServer = require('ws').Server;
var logMemUsage = require('../../../util/mem-usage');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

WebSocketServer.prototype.broadcast = function(data) {
    // Broadcasts messages to all clients
    console.log("Broadcasting " + data + " to " + numClients + " clients.");

    for (var i in this.clients) {
        this.clients[i].send(data);
    }

    console.log("Finished broadcasting " + data + " to " + numClients + " clients.");
};

var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.File) ({
            filename: 'logs/clients-messages-single.log',
            level: 'verbose'
        })
    ]
});

if (cluster.isMaster) {
    console.log("\t\t\tWS Server starting".bold.blue);
    console.log("================================================================");

    logMemUsage(1500);

    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    // Worker
    console.log("Worker #" + process.pid + " started");

    // Begin AMQP connection stuff
    var connection = amqp.createConnection({
        host: 'localhost'
    });

    // Set up AMQP connection
    connection.on('ready', function() {
        // When an AMQP connection has been established, start the WebSocket server

        var wsServer = new WebSocketServer({ port: 3000 });

        // Websocket server stuff
        // --------------------------------------
        var numClients = 0,
            numCloses = 0,
            numErrors = 0;

        wsServer.on('connection', function (ws) {
            // When a client connects, increase num
            numClients++;

            if (numClients % 500 === 0) {
                console.log(("Client connected! : ".bold + numClients).green);
            }

            ws.on('message', function (message) {
                // console.log("Received data from client: " + message);

                var data = JSON.parse(message),
                    roomId = data.roomId,
                    socketId = data.socketId,
                    time = data.time,
                    content = data.message;
                if (content) {
                    // This is a proper message that needs to be broadcast back to
                    // all clients in the same room
                    /*
                    logger.verbose("Broadcasting message: " + message + " at " +
                        (new Date()).getTime(), {
                        message: message,
                        time: new Date().getTime()
                    });
                    */

                    // Exchange has already been set on socket so just publish
                    // something to the exchange
                    // Need to find the right exchange to publish to
                    var exchange = connection.exchange('room' + roomId, {
                        type: 'fanout'
                    }, function() {
                        // console.log("Got exchange #" + roomId);

                        // Somehow optimize to not send back to orig publisher?
                        // Send a message to the room's exchange so that the appropriate queues
                        // are notified
                        exchange.publish('key', {
                            roomId: roomId,
                            content: content,
                            time: time,
                        }, {
                            contentType: 'application/json'
                        });
                    });
                } else {
                    // Initial response from client, just the room and socket information
                    // Here we create an exchange for the room and queue for the
                    // socket and AMQP Exchange
                    var ex = connection.exchange('room' + roomId, {
                        type: 'fanout'
                    }, function() {
                        // console.log("room" + roomId + " exchange set to socket " + socketId);
                    });

                    var queue = connection.queue('queue-' + socketId, function(q) {
                        // Bind queue to exchange
                        q.bind(ex, 'key'); // key not needed bc fanout

                        q.subscribe(function(data) {
                            // When a message is received in the queue, send that back
                            // to the appropriate web socket
                            // console.log("Message received on queue " + q.name + ": " + data);
                            ws.send(JSON.stringify(data));
                        });
                    });
                }
            });

            ws.on('close', function() {
                numClients--;
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
    });

}
