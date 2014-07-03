/* =========================================================================
 *
 * clients
 *  Starts multiple clients asynchronously and connects all of them to a
 *  channel
 *
 *
 * ========================================================================= */

var mqtt = require('mqtt'),
    cluster = require('cluster'),
    async = require('async'),
    colors = require('colors'),
    _ = require('lodash'),
    numCPUs = require('os').cpus().length,
    NUM_CLIENTS = 25000,
    totalClients = 0;


if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker #' + worker.process.pid + ' died.');
    });
} else {
    var workerId = cluster.worker.id;

    async.eachLimit(_.range(NUM_CLIENTS), 1000, function(i, callback) {
        var client = mqtt.createClient(8883, 'localhost');

        client.subscribe('presence');

        // client.publish('presence', 'Hello I am client #' + i + ' from worker #' + workerId);

        client.on('error', function(e) {
            console.log("Error");
        });

        setTimeout(function() {
            console.log('Calling callback for worker ' + workerId);
            // console.log('Ending client #' + i + ' from worker #' + workerId);
            // client.end();
            callback();
        }, 250);
    }, function() {
        console.log("Done");
        process.exit(1);
    });
}