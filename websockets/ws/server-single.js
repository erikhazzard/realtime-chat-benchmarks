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
var numClients = 0;

wsServer.on('connection', function (ws) {
    numClients++;
    console.log(("Client connected! : ".bold + numClients).green);

    ws.on('message', function (message) {
        console.log(("\treceived message: ".bold + message).blue);
        ws.send('' + (+new Date()) );
    });

    ws.on('close', function () {
        numClients--;
        console.log('Disconnected : '.red, numClients);
        ws.close();
    });

    ws.on('error', function(e) {
        console.log(('Client #%d error: %s', thisId, e.message).bold.red);
    });
});
