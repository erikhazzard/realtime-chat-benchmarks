/* =========================================================================
 *
 * send-single-message
 *  establishes a single connection and sends a message
 *
 *
 * ========================================================================= */
var colors = require('colors');
var async = require('async');
var _ = require('lodash');
var sjsc = require('./sockjs-client-node');
var colors = require('colors');

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

var numConnections = 0;

process.on('uncaughtException', function (err) {
    console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
    console.log('  UNCAUGHT EXCEPTION '.yellow);
    console.log(err+'');
    console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
});

// Spawn connections
// --------------------------------------
async.eachLimit(_.range(50000), 1000, function (i, cb){
    process.nextTick(function(){
        try{
            var client = sjsc.create("http://localhost:8081/echo");

            console.log(('Connecting ('+i+')').grey);

            // Setup connections, open connection
            client.on('connection', function () {
                numConnections++;
                console.log('Connected'.green.bold +
                    ' | Num connections : ' + (''+numConnections).blue);

                // continue
                setTimeout(function(){
                    console.log('\t calling callback...');
                    cb();
                }, 1000);
            });

            client.on('error', function (e) {
                console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
                console.log('  ERROR :: '.red);
                console.log(e+'');
                console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
            });
            client.on('close', function () {
                console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
                console.log('  Disconnected'.red);
                console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
            });
            client.on('data', function (msg) { 
                console.log("DATA");
            });


        } catch(err){
            console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
            console.log('  UNCAUGHT ERROR CONNECTING TO WEBSOCKET '.yellow);
            console.log(err+'');
            console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
        }
    });
});
