/* =========================================================================
 *
 * sub.js 
 *  listens for messages
 *
 * ========================================================================= */
var mqtt = require('mqtt');
var colors = require('colors');

var numConnections = 0;

var connectToClient = function connectToClient (){
    var client = mqtt.createClient(1883, 'localhost');
    var messagesReceived = 0;
    numConnections++;

    client.subscribe('presence');
    client.on('message', function (topic, message) {
        messagesReceived++;
    });

    // Connect another
    setTimeout(function(){
        setImmediate(connectToClient);
    });
};

connectToClient();

setInterval(function (){
    console.log("Number of connected clients: " + (numConnections+'').green.bold);
}, 1000);
