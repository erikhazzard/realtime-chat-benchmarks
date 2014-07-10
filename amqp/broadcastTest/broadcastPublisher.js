/* =========================================================================
 *
 * pub.js 
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

connection.on('ready', function(err) {
    //catch redis errors so server doesn't blow up
    console.log('AMQP Server connection established!'.green);

    var exchange = connection.exchange('messages', {
        type: 'fanout'
    }, function() {
        console.log("#messages exchange created");
    });

    function pub (){
        console.log('Publishing message...'.bold.green);

        exchange.publish("messages", {
            action: 'broadcast',
            message: 'Hello'
        }, {
            contentType: 'application/json',
            contentEncoding: 'utf-8'
        });

        // call it every n seconds
        setTimeout(pub, 1000);
    }
    pub();
});
