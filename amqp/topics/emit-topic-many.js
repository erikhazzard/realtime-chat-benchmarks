var amqp = require('amqp');
var _ = require('lodash');
var async = require('async');
async.eachLimit(_.range(10000), 500, function iterator (i, callback){
    var connection = amqp.createConnection({host: 'localhost'});
    var message = {
        date: +new Date(),
        i: i
    };

    connection.on('ready', function(){
        connection.exchange( 'topic_logs', {type: 'topic', autoDelete: false}, function(exchange){
            exchange.publish('roomId1', JSON.stringify(message));
            console.log("Sent message : " + message);
        });
        callback();
    });

}, function done (err) {
    console.log('Done! : ' + err);
});
