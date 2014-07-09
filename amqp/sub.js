/* =========================================================================
 *
 * sub.js 
 *  publishes messages
 *
 * ========================================================================= */
var colors = require('colors');
var amqp = require('amqp');
var connection = amqp.createConnection({ host: 'localhost' });

connection.on('error', function(err) {
    if((err+'').match('socket is closed')){
        console.log('Could not connect to AMQP (rabbitmq-server is not running)');
    }
    console.log('Error: ' + (err+'').red);
});

var messagesReceived = 0;

connection.on('ready', function(err) {
    //catch redis errors so server doesn't blow up
    console.log('AMQP Server connection established!'.green);

    var queue = connection.queue(
        'pubsub',
        function (queue) {
            console.log('Queue ' + queue.name + ' is open');
    });

    queue.subscribe(function queueCallback (message, headers, deliveryInfo, messageObject){
        // when message is received, increment counter
        messagesReceived++;
    });

    setInterval(function (){
        console.log("Messages per second: " + (messagesReceived+'').green.bold);
        messagesReceived = 0;
    }, 1000);
});
