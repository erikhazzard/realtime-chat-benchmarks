/* =========================================================================
 *
 * Clients:
 *  Starts multiple clients asynchronously and connects all of them to a
 *  channel
 *  
 * After creating all clients. The script will send one message to each room
 * which will be received from every member of the room
 *
 * After this is done, we call the date_diff.sh shell script, which compares
 * the first log entry and the last log entry and substract their time stamps
 *
 * ========================================================================= */

var mqtt = require('mqtt'),
    cluster = require('cluster'),
    async = require('async'),
    colors = require('colors'),
    winston = require('winston'),
    _ = require('lodash'),
    numCPUs = require('os').cpus().length,
    fs = require('fs'),
    NUMBER_OF_BROADCASTERS = process.argv[2] || 1;


winston.info("Number of broadcasters: ", NUMBER_OF_BROADCASTERS);
var client = mqtt.createClient(8883, 'localhost');


client.on('error', function(e) {
    winston.error("Error", JSON.stringify(e));
    
});

client.on('connect', function(){

    winston.info("Client connected");

});

client.subscribe('TEST_ROOM');


setTimeout(function(d, i){

    for (var i = 0; i < NUMBER_OF_BROADCASTERS; i++) {
        setInterval(function(d, i){
            client.publish("TEST_ROOM", "Hello World");

        }, i * 70);
    };

},100);



