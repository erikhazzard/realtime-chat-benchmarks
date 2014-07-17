var amqp = require('amqp');
var _ = require('lodash');
var async = require('async');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) { cluster.fork(); }
} else {
    console.log('Worker started');

    async.eachLimit(_.range(10000), 500, function iterator (i, callback){
        var connection = amqp.createConnection({host: 'localhost'});
        var message = {
            date: +new Date(),
            i: i
        };

        connection.on('ready', function(){
            connection.exchange( 'topic_logs', {type: 'topic', autoDelete: false}, function(exchange){
                exchange.publish('roomId1', JSON.stringify(message));
                if (i % 200 === 0) {
                    console.log('Sent message (' + cluster.worker.id + ') | i: ' + i)
                }
            });
            callback();
        });

    }, function done (err) {
        console.log('Done! : ' + err);
    });

}
