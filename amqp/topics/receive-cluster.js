var amqp = require('amqp');
var connection = amqp.createConnection({host: 'localhost'});
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

var routing = '#';

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) { cluster.fork(); }
} else {
    console.log('Worker started');

    connection.on('ready', function(){
        connection.exchange( 'topic_logs', {type: 'topic', autoDelete: false}, function(exchange){

            connection.queue('tmp-' + Math.random(), {exclusive: true},
                function(queue){
                    queue.bind('topic_logs', routing);
                    console.log('Waiting for messages on : ' + routing);

                    queue.subscribe(function(msg){
                        var message = JSON.parse(msg.data.toString('utf-8'));
                        console.log(cluster.worker.id + " | " + message);
                    });
            });

        });

    });

}
