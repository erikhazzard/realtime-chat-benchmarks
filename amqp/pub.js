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

    function pub (){
        connection.publish(
            'pubsub',
            { message: "Hello", token: "test" }, 
            { contentType: 'application/json', contentEncoding: 'utf-8' }
        );
        setImmediate(pub);
    }
    pub();
});
