/**
 *
 *  server-single
 *
 *  Spawns a single ws server that echoes received messages
 *
 */

require("http").globalAgent.maxSockets = Infinity;
var WebSocketServer = require('ws').Server,
    wsServer = new WebSocketServer({port: 3000});
var colors = require('colors');
var logMemUsage = require('../../../util/mem-usage');

console.log("\t\t\tWS Server starting".bold.blue);
console.log("================================================================");

logMemUsage(1500);

// Websocket server
// --------------------------------------
var numClients = 0,
    numCloses = 0,
    numErrors = 0;

wsServer.on('connection', function (ws) {
    numClients++;
    if (numClients % 500 === 0) {
        console.log(("Client connected! : " + numClients).green);
    }

    ws.on('message', function (message) {
        // For now this server just echoes the message back to the socket
        console.log("Received mesage: " + message);
        ws.send(message);
    });

    ws.on('close', function () {
        numClients--;
        numCloses++;
        console.log(('Client closed; total number of closes: ' + numCloses).red);
    });

    ws.on('error', function (e) {
        numErrors++;
        console.log(("Total number of errors: " + numErrors).red);
        console.log(('Client #%d error: %s', thisId, e.message).red);
    });
});