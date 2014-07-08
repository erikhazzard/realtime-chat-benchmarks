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
    NUM_CLIENTS = 100,
    totalClients = 0;

var msgNr = 0;
var roomId = 0;
var MAX_NR_PEOPLE_IN_ROOM = 5;
var roomName = "m-" + roomId;


var start = new Date();

async.eachLimit(_.range(NUM_CLIENTS), 20, function(i, callback) {

    if(i % MAX_NR_PEOPLE_IN_ROOM == 0){
        roomId++;
        roomName = "m-"+roomId;
        

    }

    var client = mqtt.createClient(8883, 'localhost');

    client.on('error', function(e) {
        winston.error("Error");
    });

    client.subscribe(roomName);

    client.on('connect', function(){
        console.log("Connected", i);
        process.nextTick(function(){
            
            callback();
        });

    });


    client.on("message", function(topic, message) {
        winston.info("NR:: ", msgNr , "- MSG::", message, "room: ", topic);  
        msgNr++;
    });

}, function(err, res) {
    //process.exit(1);
    var end = new Date() - start;


    winston.info("Execution time: %ds", end/1000);

    // _.each(clients, function(cl, i){
    //     cl.publish('messages', 'mqtt-'+i);
    // });

    // setTimeout(function(d, i){
    //     return d;
    // });

});
