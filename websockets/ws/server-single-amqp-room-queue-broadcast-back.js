/**
 *
 *  server-single-amqp-room-queue-broadcast-back
 *
 *  Non-clustered node server responsible for broadcasting any
 *  received messages back to the client by first communicating
 *  through AMQP
 *
 *  This benchmark creates a queue for each room as opposed to each
 *  client and stores information about which sockets are connected
 *  to which queue; after a messages is received from the queue, it
 *  gets broadcasted to all of the sockets associated to the queue.
 *
 */

require("http").globalAgent.maxSockets = Infinity;
var colors = require('colors');
var winston = require('winston');
var async = require('async');
var _ = require('lodash');
var amqp = require('amqp');
var WebSocketServer = require('ws').Server;

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

console.log("\t\t\tWS Server starting".bold.blue);
console.log("================================================================");

// Stats overview
// --------------------------------------
function format (val){
    return Math.round(((val / 1024 / 1024) * 1000) / 1000) + 'mb';
}

var statsId = setInterval(function () {
    console.log('Memory Usage :: '.bold.green.inverse +
        ("\tRSS: " + format(process.memoryUsage().rss)).blue +
        ("\tHeap Total: " + format(process.memoryUsage().heapTotal)).yellow +
        ("\t\tHeap Used: " + format(process.memoryUsage().heapUsed)).magenta
    );
}, 1500);

// Begin AMQP connection stuff
var connection = amqp.createConnection({
    host: 'localhost'
});

// Set up AMQP connection
connection.on('ready', function() {
    // When an AMQP connection has been established, start the
    // WebSocket server

    var wsServer = new WebSocketServer({ port: 3000 });

    // Websocket server stuff
    // --------------------------------------
    var numClients = 0,
        numCloses = 0,
        numErrors = 0;

    // Array of queues, one for each room
    var queues = [];

    wsServer.on('connection', function (ws) {
        // When a client connects, increase num
        numClients++;

        if (numClients % 500 === 0) {
            console.log(("Client connected! : ".bold + numClients).green);
        }

        ws.on('message', function (message) {
            console.log("Received data from client: " + message);

            var data = JSON.parse(message),
                roomId = data.roomId,
                socketId = data.socketId,
                content = data.message;
            if (content) {
                // This is a proper message that needs to be broadcast back to all
                // clients in the same room
                logger.verbose("Broadcasting message: " + message + " at " + (new Date()).getTime(), {
                    message: message,
                    time: new Date().getTime()
                });

                // Exchange has already been set on socket so just publish something to
                // the exchange
                // Need to find the right exchange to publish to
                var exchange = connection.exchange('room' + roomId, {
                    type: 'fanout'
                }, function() {
                    console.log("Got exchange #" + roomId);

                    // Somehow optimize to not send back to orig publisher?
                    // Send a message to the room's exchange so that the appropriate queues
                    // are notified
                    exchange.publish('key', {
                        roomId: roomId,
                        socketId: socketId,
                        content: content
                    }, {
                        contentType: 'application/json'
                    });
                });
            } else {
                // Initial response from client, just the room and socket information
                // Here we create an exchange for the room and queue for the socket
                // and AMQP Exchange
                var ex = connection.exchange('room' + roomId, {
                    type: 'fanout'
                }, function() {
                    console.log("room" + roomId + " exchange set to socket " + socketId);
                });

                if (queues[roomId]) {
                    // Room has been created; just add to the sockets array
                    queues[roomId].sockets.push(ws);
                } else {
                    // If the queue hasn't already been created, create it
                    var q = connection.queue('queue-' + roomId, function(q) {
                        // Bind queue to exchange
                        q.bind(ex, 'key'); // key not needed bc fanout

                        q.subscribe(function(data) {
                            // When a message is received in the queue, send that back
                            // to all of the queue's web sockets
                            console.log("Message received on queue " + q.name + ": " + data);
                            var roomId = data.roomId,
                                sockets = queues[roomId].sockets;

                            for (var i = 0; i < sockets.length; i++) {
                                sockets[i].send(data.content);
                            }
                        });
                    });

                    // Use object to store all of the sockets
                    var queue = {
                        queue: q,
                        sockets: [ws]
                    };

                    queues[roomId] = queue;
                }
            }
        });

        ws.on('close', function() {
            // TODO: logic to remove the socket from the queues array

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