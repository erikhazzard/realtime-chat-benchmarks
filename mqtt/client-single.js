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
    NUM_CLIENTS = 45000,
    totalClients = 0;


async.eachLimit(_.range(NUM_CLIENTS), 10, function(i, callback) {
    var client = mqtt.createClient(8883, 'localhost');

    client.on('error', function(e) {
        console.log("Error");
    });

    client.on('connect', function(){
        console.log("Connected");
        process.nextTick(function(){
            callback();
        });
    });

}, function() {
    console.log("Done");
    process.exit(1);
});
