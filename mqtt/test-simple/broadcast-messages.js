/* =========================================================================
 *
 * clients
 *  Starts multiple clients asynchronously and connects all of them to a
 *  channel
 *
 *
 * ========================================================================= */

var mqtt = require('mqtt'),
    cluster = require('cluster'),
    async = require('async'),
    colors = require('colors'),
    winston = require('winston'),
    _ = require('lodash'),
    numCPUs = require('os').cpus().length,
    NUM_CLIENTS = Math.floor(100/5),
    totalClients = 0;

var clients = [];

async.eachLimit(_.range(NUM_CLIENTS), NUM_CLIENTS, function(i, callback) {

    var client = mqtt.createClient(8883, 'localhost');

    client.on('error', function(e) {
        winston.error("Error", e);
    });

    var roomId = "m-"+i;

    client.subscribe(roomId);

    client.on('connect', function(){

        process.nextTick(function(){
            clients.push(client);
            callback();
        });

    });

    if(i === 0){
        //We just send the profiling method when we broadcast the first message
        client.publish('profiling', 'STARTED-' + NUM_CLIENTS);    
    }
    
    client.on('message', function(topic, message) {
      winston.info("MSG:: ",message, "room", topic);

    });

    
}, function(err, res) {
    
    _.each(clients, function(cl, i){
        var roomId = 'm-' + (i + 1);
        
        // The concated string in the second argument of the 
        // of the publish method is neccessary otherwise it throws errors
        cl.publish(roomId, i + '');
        //process.exit(0);
    });


});
