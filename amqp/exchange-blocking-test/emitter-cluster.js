/**
 *
 *  Emits large messages to AMQP to see whether or not they block
 *  when they all publish to one exchange.
 *
 *  Uses async to publish messages synchronously.
 *
 */

var amqp = require('amqp');
var fs = require('fs');
var _ = require('lodash');
var async = require('async');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

var filename = './data.json'; // > 10 MB
var fileContents = fs.readFileSync(filename, 'utf8');
var data = (JSON.parse(fileContents)).message;

var EXCHANGE_NAME = 'test';
var ROUTING_KEY = 'route';
var NUM_MESSAGES = process.argv[2] || 60;

function getMessage() {
    // Returns a message with the current time and a lot of text
    return {
        date: new Date().getTime(),
        stuff: data
    };
}

if (cluster.isMaster) {

    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function onWorkerExit(worker, code, signal) {
        console.log("Worker " + worker.process.pid + " died.");
    });
} else {
    console.log("Worker " + cluster.worker.id + " started.");

    var connection = amqp.createConnection({ host: 'localhost' });

    connection.on('ready', function onConnectionReady() {

        connection.exchange(EXCHANGE_NAME, {
            type: 'topic',
            autoDelete: false,
            confirm: true // true for publish callback
        }, function (exchange) {

            // Can switch between eachSeries and each if you want to test
            async.eachSeries(_.range(Math.floor(NUM_MESSAGES / numCPUs)), function each(i, cb) {
                // Using each series as opposed to each because publishing all of
                // the messages at the same time seems to block (probably because
                // of node but idk)

                exchange.publish(ROUTING_KEY, getMessage(), {
                    contentType: 'application/json'
                }, function onPublished() {
                    console.log("Sent out message #" + i + " from worker " + cluster.worker.id);

                    cb();
                });

            }, function onCompleteAsync() {
                console.log("Sent out " + (NUM_MESSAGES / numCPUs) + " messages from worker " + cluster.worker.id);

            });
        });
    });
}
