/**
 *
 *  Broadcasts a messages intermittently to all clients of the ws server
 *  Records the total number of client closes and errors and reports them
 *  if they exist
 *
 */

require("http").globalAgent.maxSockets = Infinity;
var WebSocketServer = require('ws').Server,
    wsServer = new WebSocketServer({port: 3000});
var colors = require('colors');

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

// Websocket server
// --------------------------------------
var numClients = 0,
    numCloses = 0,
    numErrors = 0;

wsServer.on('connection', function (ws) {
    numClients++;
    if (numClients % 500 === 0) {
        console.log(("Client connected! : ".bold + numClients).green);
    }

    ws.on('message', function (message) {
        // console.log(("\treceived message: ".bold + message).blue);
        // ws.send('' + (+new Date()) );
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

wsServer.broadcast = function(data) {
    console.log("Broadcasting " + data + " to " + numClients + " clients.");
    for (var i in this.clients) {
        this.clients[i].send(data);
    }

    console.log("Finished broadcasting " + data + " to " + numClients + " clients.");
};

setInterval(function() {
    // Routinely broadcast a message to all clients

    console.log("Broadcasting...");
    wsServer.broadcast("hello");

}, 2000);