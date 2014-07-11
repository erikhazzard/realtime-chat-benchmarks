/* =========================================================================
 *
 *  client-cluster-connections
 *
 *  Spawns a clustered bunch of connections that
 *
 *
 * ========================================================================= */

var WebSocket = require('ws');
var colors = require('colors');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var async = require('async');
var _ = require('lodash');
var logMemUsage = require('../../../util/mem-usage');

var NUM_CONNECTIONS = 10000;

if (cluster.isMaster) {
    logMemUsage(1500);

    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function (worker, code, signal) {
        console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
        console.log(('worker ' + worker.process.pid + ' died').red);
        console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
    });
} else {
    process.on('uncaughtException', function (err) {
        console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
        console.log('UNCAUGHT EXCEPTION'.yellow);
        console.log(err + '');
        console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
    });

    console.log(('Worker started! ' + cluster.worker.id).grey);

    async.eachLimit(_.range(NUM_CONNECTIONS), NUM_CONNECTIONS / 20, function (i, cb) {
        try {
            var ws = new WebSocket('ws://localhost:3000/', {
                protocolVersion: 8,
                origin: 'http://localhost:3000'
            });

            console.log("Connecting #" + i + " on worker #" + cluster.worker.id);

            // Setup connections, open connection
            ws.on('open', function setupConnection() {

                // continue, allow some time between establishing connections
                setTimeout(cb, 1000);
            });

            ws.on('close', function () {
                console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
                console.log("Socket #" + i + " disconnected".red);
                console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
            });
        } catch(err) {
            console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
            console.log('UNCAUGHT ERROR CONNECTING TO WEBSOCKET '.yellow);
            console.log(err+'');
            console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
        }
    }, function onDoneConnecting() {
        // all of the async calls have finished
        console.log("Done connecting " + NUM_CONNECTIONS + " clients.");
    });
}
