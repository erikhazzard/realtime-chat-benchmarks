/**
 *
 *  sever-cluster-broadcast-back
 *
 *  Broadcasts all received messages to all connected clients and logs the
 *  time to see how long it takes for a message to propagate from a
 *  client to all clients
 *
 *  DOES NOT WORk :(
 *
 */

require("http").globalAgent.maxSockets = Infinity;
var colors = require('colors');
var winston = require('winston');
var async = require('async');
var _ = require('lodash');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var amqp = require('amqp');

var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.File) ({
            filename: 'logs/clients-messages-single.log',
            level: 'verbose'
        })
    ]
});

// Stats overview
// --------------------------------------
function format(val) {
    return Math.round(((val / 1024 / 1024) * 1000) / 1000) + 'mb';
}

if (cluster.isMaster) {
    console.log("\t\t\tWS Server starting".bold.blue);
    console.log("================================================================");

    var statsId = setInterval(function () {
        console.log('Memory Usage :: '.bold.green.inverse +
            ("\tRSS: " + format(process.memoryUsage().rss)).blue +
            ("\tHeap Total: " + format(process.memoryUsage().heapTotal)).yellow +
            ("\t\tHeap Used: " + format(process.memoryUsage().heapUsed)).magenta
        );
    }, 1500);

    var connection = amqp.createConnection({
        host: 'localhost'
    });

    connection.on('ready', function() {
        var ex = connection.exchange('messages', {
            type: 'fanout'
        }, function() {
            console.log("#messages exchange created on master");

            for (var i = 0; i < numCPUs; i++) {
                cluster.fork();
            }

            cluster.on('exit', function(worker, code, signal) {
                console.log('worker ' + worker.process.pid + ' died');
            });
        });
    });

} else {
    // Websocket server
    // --------------------------------------
    console.log(('Worker started! ' + cluster.worker.id).grey);

    // Connect to AMQP
    var connection = amqp.createConnection({
        host: 'localhost'
    });

    connection.on('ready', function() {
        var ex = connection.exchange('messages', {
            type: 'fanout',
            passive: true
        }, function() {
            console.log("#messages exchange created");
        });

        connection.queue('messages', function(q) {
            var WebSocketServer = require('ws').Server,
                wsServer = new WebSocketServer({port: 3000});

            console.log("Worker #" + cluster.worker.id + " now connected to " + "queue " + q.name);

            q.bind(ex, "messages", function() {
                console.log('Queue from worker #' + cluster.worker.id +
                    " bound to #messages");
            });

            q.subscribe(function(message, headers, deliveryInfo, messageObject) {
                console.log("Message received from AMQP! " + cluster.worker.id);

                if (message.action == 'broadcast') {
                    // broadcast to all clients
                    logger.verbose("Message received from AMQP, broadcasting...", {
                        message: message
                    });
                    wsServer.broadcast(message.message);
                }
            });

            var numClients = 0,
                numCloses = 0,
                numErrors = 0;

            wsServer.broadcast = function(data) {
                console.log("Broadcasting " + data + " to " + numClients + " clients.");

                for (var i in this.clients) {
                    this.clients[i].send(data);
                }

                console.log("Finished broadcasting " + data + " to " + numClients + " clients.");
            };

            wsServer.on('connection', function (ws) {
                numClients++;
                if (numClients % 500 === 0) {
                    console.log(("500 clients connected! Total: ".bold + numClients).green);
                }

                ws.on('message', function (message) {
                    console.log(("Received message: ".bold + message).yellow);

                    logger.verbose("Sending message to AMQP", {
                        message: message,
                        time: new Date().getTime()
                    });

                    // When a message is received, send a message to AMQP to alert
                    // other workers that a message has been sent
                    ex.publish("messages", {
                        action: 'broadcast',
                        message: message
                    }, {
                        contentType: 'application/json',
                        contentEncoding: 'utf-8'
                    });
                });

                ws.on('close', function () {
                    numClients--;
                    numCloses++;
                    console.log(('Client closed; total number of closes: ' + numCloses).bold.red);
                    // console.log('Disconnected : '.red, numClients);
                    ws.close();
                });

                ws.on('error', function(e) {
                    numErrors++;
                    console.log(("Total number of errors: " + numErrors).bold.red);
                    console.log(('Client #%d error: %s', thisId, e.message).bold.red);
                });
            });
        });
    });
}
