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
var async = require('async');
var _ = require('lodash');

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

    cluster.on('exit', function (worker, code, signal) {
        console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
        console.log(('worker ' + worker.process.pid + ' died').red);
        console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
    });

} else {
    console.log(('Worker started! ' + cluster.worker.id).grey);
    var numConnections = 0;

    async.eachLimit(_.range(5000), 1000, function (i, cb){
        var WebSocket = require('ws');
        try{
            var ws = new WebSocket('ws://localhost:3000/', {
                protocolVersion: 8, 
                origin: 'http://localhost:3000'
            });
            var colors = require('colors');

            console.log(('Connecting : worker ' + cluster.worker.id + '... ('+i+')').grey);

            // Setup connections, open connection
            ws.on('open', function () {
                numConnections++;
                console.log('Connected'.green.bold + ' worker: ' + 
                    cluster.worker.id +
                    ' | Num connections : ' + (''+numConnections).blue);

                // continue
                setTimeout(function(){
                    console.log('\t calling callback... worker: ' + cluster.worker.id);
                    cb();
                }, 1000);
            });

            ws.on('close', function () {
                console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
                console.log('  Disconnected'.red);
                console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
            });
        } catch(err){
            console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
            console.log('  UNCAUGHT ERROR CONNECTING TO WEBSOCKET '.yellow);
            console.log(err+'');
            console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
        }

    });
}
