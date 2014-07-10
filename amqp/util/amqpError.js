module.exports = function amqpError(err) {
    // Handle errors
    if((err+'').match('socket is closed')){
        console.log('Could not connect to AMQP (rabbitmq-server is not running)');
    }
    console.log('Error: ' + (err+'').red);
};
