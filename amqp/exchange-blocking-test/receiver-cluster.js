/**
 *
 *  Subscribes to the AMQP exchange and logs the differences in times. Binds
 *  queues to an exchange depending on the process ID of the node process.
 *
 *
 */

var amqp = require('amqp');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

var EXCHANGE_NAME = 'test';
var ROUTING_KEY = 'route';
var AMQP_HOST = 'localhost';

var numMessagesReceived = 0;
var lastMessageReceivedTime;

if (cluster.isMaster) {

    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function onWorkerExit(worker, code, signal) {
        console.log("Worker " + worker.process.pid + " died.");
    });
} else {
    console.log("Worker " + cluster.worker.id + " started.");

    var connection = amqp.createConnection({ host: 'localhost' }),
        workerId = cluster.worker.id; // 0-3

    connection.on('ready', function onConnectionReady() {
        console.log("Connection to AMQP established @ " + AMQP_HOST);

        connection.exchange(EXCHANGE_NAME, {
            type: 'topic',
            autoDelete: false
        }, function (exchange) {
            connection.queue('room', function (queue) {

                queue.bind(EXCHANGE_NAME, ROUTING_KEY + workerId);

                console.log("Worker " + workerId + " is waiting for messages on " + workerId);

                queue.subscribe(function onMessageReceived(message) {
                    numMessagesReceived++;

                    console.log("Message received... total: " + numMessagesReceived);

                    var timeDiff = new Date().getTime() - message.date;

                    console.log("Received message. Time difference: " + timeDiff);
                });
            });
        });
    });

    connection.on('error', function onError(e) {
        console.log(e);
    });
}
