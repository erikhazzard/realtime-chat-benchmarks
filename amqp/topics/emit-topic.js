var amqp = require('amqp');
var connection = amqp.createConnection({host: 'localhost'});
var message = "Hello " + (Math.random() * 100 | 0);

connection.on('ready', function(){

    connection.exchange( 'topic_logs', {type: 'topic', autoDelete: false}, function(exchange){

        exchange.publish('roomId1', message);
        console.log("Sent message : " + message);

    });

});
