/* =========================================================================
 *
 * send-single-message
 *  establishes a single connection and sends a message
 *
 *
 * ========================================================================= */
var WebSocket = require('ws');
var colors = require('colors');
var async = require('async');
var _ = require('lodash');
var logMemUsage = require('../../../util/mem-usage');


var NUM_CONNECTIONS = 30000;

logMemUsage(1500);

process.on('uncaughtException', function (err) {
    console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
    console.log('  UNCAUGHT EXCEPTION '.yellow);
    console.log(err+'');
    console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
});

// Spawn connections
// --------------------------------------

async.eachLimit(_.range(NUM_CONNECTIONS), NUM_CONNECTIONS / 20, function (i, cb) {
    try {
        var ws = new WebSocket('ws://localhost:3000/', {
            protocolVersion: 8,
            origin: 'http://localhost:3000'
        });

        console.log(('Connecting socket #' + i).grey);

        // Setup connections, open connection
        ws.on('open', function setupConnection() {

            // Wait a bit to connect the next socket
            setTimeout(function (){
                console.log('\t calling callback...');
                cb();
            }, 1000);
        });

        ws.on('message', function(data) {
            console.log("Received data: " + data);
        });

        ws.on('close', function () {
            console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
            console.log("Client #" + i + " disconnected".red);
            console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
        });
    } catch(err) {
        console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
        console.log('UNCAUGHT ERROR CONNECTING TO WEBSOCKET:'.yellow);
        console.log(err + '');
        console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
    }
}, function() {
    // Callback when the async call is finished
    console.log(("Done connecting " + NUM_CONNECTIONS + " connections.").yellow);
});
