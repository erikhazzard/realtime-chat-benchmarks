/**
 *
 *  Emits large messages to AMQP to see whether or not they block
 *  when they all publish to one exchange.
 *
 *  Just uses a for loop
 *
 */

var amqp = require('amqp');
var fs = require('fs');
var _ = require('lodash');
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


            for (var i = 0; i < Math.floor(NUM_MESSAGES / numCPUs); i++) {
                exchange.publish(ROUTING_KEY, getMessage(), {
                    contentType: 'application/json'
                }, function onPublished() {
                    console.log("Sent out message #" + i + " from worker " + cluster.worker.id);
                });
            }
        });
    });
}
