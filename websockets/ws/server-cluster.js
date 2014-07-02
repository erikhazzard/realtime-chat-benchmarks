var colors = require('colors');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

// Stats overview
// --------------------------------------
function format (val){
    return Math.round(((val / 1024 / 1024) * 1000) / 1000) + 'mb';
}

if (cluster.isMaster) {
    // Fork workers.
    console.log("\t\t\tWS Server starting".bold.blue);
    console.log("================================================================");

    var statsId = setInterval(function () {
        console.log('Memory Usage :: '.bold.green.inverse +
            ("\tRSS: " + format(process.memoryUsage().rss)).blue +
            ("\tHeap Total: " + format(process.memoryUsage().heapTotal)).red +
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
    var WebSocketServer = require('ws').Server, 
        wsServer = new WebSocketServer({port: 3000});

    var numClients = 0;
    wsServer.on('connection', function (ws) {
        numClients++;
        console.log(("Client connected! : ".bold + numClients).green + 
            '| worker: ' + cluster.worker.id);

        ws.on('message', function (message) {
            console.log(("\treceived message: ".bold + message).blue +
                '| worker: ' + cluster.worker.id);
            ws.send('' + (+new Date()) );
        });

        ws.on('close', function () {
            numClients--;
            console.log('Disconnected : ', numClients +
                '| worker: ' + cluster.worker.id);
        });

        ws.on('error', function(e) {
            console.log(('Client #%d error: %s', thisId, e.message).bold.red +
                '| worker: ' + cluster.worker.id);
        });
    });

}
