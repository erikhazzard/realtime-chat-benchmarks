/* =========================================================================
 *
 * sub.js 
 *  spins up a ton of amqp clients and waits for a message
 *
 * ========================================================================= */
var colors = require('colors');
var amqp = require('amqp');
var _ = require('lodash');
var d3 = require('d3');
var async = require('async');
var amqpError = require('../util/amqpError');

// configure 
var numClients = process.argv.slice(2)[0] || 100;
var messagesReceived = 0;
var clientsConnected = 0;

// Launch it
// --------------------------------------
console.log('Starting up : ' + (''+numClients).inverse + ' clients...');

// Generate a bunch of test clients
var connectionStart = new Date();
async.eachLimit(
    _.range(numClients), // array
    50, // limit
    function iterator(i, callback){
        var connection = amqp.createConnection({ host: 'localhost' });

        connection.on('error', amqpError);

        // log some progress
        if(i % 1000 === 0){
            console.log(('\t > ' + i + ' clients connected').blue);
        }
        
        connection.on('ready', function (err) {
            var exchange = connection.exchange('messages', {
                type: 'fanout'
            }, function() { });

            // setup queue
            var queue = connection.queue(
                'pubsub' + i,
                function (q) {
                    q.bind(exchange, "messages", function() { });
                    q.subscribe(function queueCallback (message, headers, deliveryInfo, messageObject){
                        // when message is received, increment counter
                        messagesReceived++;
                    });

                    // Conncetion finished
                    clientsConnected++;
                    callback();
            });

        });
    }, 
    function callback (err){
        // When all the clients are connected, publish messages occasionally
        console.log(
            ('All ' + numClients + ' clients connected in ').green +
            (' '+(new Date() - connectionStart)+' ').green.inverse + 
            ' ms'.green
        );
    }
);


// Show stats
// --------------------------------------
setInterval(function showStats(){
    console.log('');
    console.log('Clients connected: ' + 
        (''+d3.format(',')(clientsConnected)).bold.green);
    console.log('Messages received: ' + 
        (''+d3.format(',')(messagesReceived)).blue);
}, 500);
