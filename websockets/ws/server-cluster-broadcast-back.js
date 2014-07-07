/**
 *
 *  sever-single-broadcast-back
 *
 *  Broadcasts all received messages to all connected clients and logs the
 *  time to see how long it takes for a message to propagate from a
 *  client to all clients
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

    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    // Websocket server
    // --------------------------------------
    console.log(('Worker started! ' + cluster.worker.id).grey);

    var connection = amqp.createConnection({
        host: 'localhost'
    });

    connection.on('ready', function() {

        connection.queue('messages', function(queue) {

            queue.subscribe(function(message) {
                if (message.action == 'broadcast') {
                    // broadcast to all clients
                    for (var i in this.clients) {
                        this.clients[i].send(data);
                    }
                }
                console.log(message);
                winston.log(message);
                console.log("Message received: " + message);
            });

            connection.publish('messages', {
                message: 'hi'
            }, {
                contentType: 'application/json',
                contentEncoding: 'utf-8'
            });
        });
    });

    var WebSocketServer = require('ws').Server,
        wsServer = new WebSocketServer({port: 3000});

    var numClients = 0,
        numCloses = 0,
        numErrors = 0;

    wsServer.broadcast = function(data) {
        console.log("Broadcasting " + data + " to " + numClients + " clients.");

        // send broadcast message to AMQP connection
        connection.publish('messages', {
            action: 'broadcast'
        }, {
            contentType: 'application/json',
            contentEncoding: 'utf-8'
        });

        /*
        for (var i in this.clients) {
            this.clients[i].send(data);
        }
        */

        console.log("Finished broadcasting " + data + " to " + numClients + " clients.");
    };


    wsServer.on('connection', function (ws) {
        numClients++;
        if (numClients % 500 === 0) {
            console.log(("Client connected! : ".bold + numClients).green);
        }

        ws.on('message', function (message) {
            console.log(("\treceived message: ".bold + message).blue);

            logger.verbose("Broadcasting message: " + message + " at " + (new Date()).getTime(), {
                message: message,
                time: new Date().getTime()
            });
            wsServer.broadcast(message);
            // relay message back to see how long it takes
            // ws.send(message);
            //ws.send('' + (+new Date()) );
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
}
