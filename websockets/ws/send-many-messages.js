/* =========================================================================
 *
 * send-single-message
 *  establishes a single connection and sends a message
 *
 *
 * ========================================================================= */

var colors = require('colors');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

// Stats overview
// --------------------------------------
function format (val){
    return Math.round(((val / 1024 / 1024) * 1000) / 1000) + 'mb';
}

if (cluster.isMaster) {
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
    console.log(('Worker started! ' + cluster.worker.id).grey);

    var WebSocket = require('ws');
    var ws = new WebSocket('ws://localhost:3000/', {
        protocolVersion: 8, 
        origin: 'http://localhost:3000'
    });
    var colors = require('colors');

    console.log('Connecting...'.grey);

    // When a message is received from the server, log the roundtrip time and send
    // another one
    ws.on('message', function(data, flags) {
        console.log('\tReceived message : '.green.bold +
            (( Date.now() - new Date(+data) ) + 'ms').magenta
        );

        // send a message after some time
        setTimeout(function() {
            console.log('Sending message...'.blue);
            ws.send(''+(+Date.now()), {mask: true});
        }, 500);
    });

    // Setup connections, open connection
    ws.on('open', function() {
        console.log('Connected'.green.bold + ' | sending message...');

        // send a message on connection
        ws.send(''+(+Date.now()), {mask: true});
    });

    ws.on('close', function() {
        console.log('Disconnected');
        process.exit(1);
    });

}
