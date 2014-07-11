/**
 *
 *  server-cluster
 *
 *  Spawns a cluster of WebSocket servers that echo the message back
 *
 */

var colors = require('colors');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var logMemUsage = require('../../../util/mem-usage');
var WebSocketServer = require('ws').Server;

if (cluster.isMaster) {
    // Fork workers.
    console.log("\t\t\tWS Server starting".bold.blue);
    console.log("==============================================================");

    logMemUsage(1500);

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
    var wsServer = new WebSocketServer({port: 3000});

    var numClients = 0;

    wsServer.on('connection', function (ws) {
        // Callback for when a client connects to the server
        numClients++;

        console.log(("Client connected! : " + numClients).green +
            '| worker: ' + cluster.worker.id);

        ws.on('message', function (message) {
            console.log("Received message: " + message + " from worker " +
                cluster.worker.id);

            // Echoes message back to socket
            ws.send(message);
        });

        ws.on('close', function () {
            numClients--;
            console.log('Disconnected : '.red, numClients +
                '| worker: ' + cluster.worker.id);
        });

        ws.on('error', function (e) {
            console.log(('Client #%d error: %s', thisId, e.message).red +
                '| worker: ' + cluster.worker.id);
        });
    });

}
