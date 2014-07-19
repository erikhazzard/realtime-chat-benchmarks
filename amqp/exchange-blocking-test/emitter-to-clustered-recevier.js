/**
 *
 *  Emits large messages to AMQP to see whether or not they block
 *  when they all publish to one exchange.
 *
 *  Uses async to publish messages synchronously. The routing key is
 *  dependent upon the number of CPUs.
 *
 */

var amqp = require('amqp');
var fs = require('fs');
var _ = require('lodash');
var async = require('async');

var filename = './data.json'; // > 10 MB
var fileContents = fs.readFileSync(filename, 'utf8');
var data = (JSON.parse(fileContents)).message;
var numCPUs = require('os').cpus().length;

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

var connection = amqp.createConnection({ host: 'localhost' });

connection.on('ready', function onConnectionReady() {

    connection.exchange(EXCHANGE_NAME, {
        type: 'topic',
        autoDelete: false,
        confirm: true // true for publish callback
    }, function (exchange) {

        async.eachSeries(_.range(NUM_MESSAGES), function each(i, cb) {
            // Using each series as opposed to each because publishing all of
            // the messages at the same time seems to block (probably because
            // of node but idk)

            exchange.publish(ROUTING_KEY + ((i % numCPUs) + 1), getMessage(), {
                contentType: 'application/json'
            }, function onPublished() {
                console.log("Sent out message #" + i + " to route " + ((i % numCPUs) + 1));

                cb();
            });

        }, function onCompleteAsync() {
            console.log("Sent out " + NUM_MESSAGES + " messages. Exiting...");

            process.exit(1);

            /*
            exchange.publish(ROUTING_KEY, {
                date: new Date().getTime()
            }, {
                contentType: 'application/json'
            }, function onPublished() {
                console.log("Sent out last small msg");
                process.exit(1);
            });
            */

        });
    });
});
