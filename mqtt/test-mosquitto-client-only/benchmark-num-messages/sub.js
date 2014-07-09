/* =========================================================================
 *
 * sub.js 
 *  listens for messages
 *
 * ========================================================================= */
var mqtt = require('mqtt');
var colors = require('colors');

var client = mqtt.createClient(1883, 'localhost');

var messagesReceived = 0;

client.subscribe('presence');

client.on('message', function (topic, message) {
    messagesReceived++;
});

setInterval(function (){
    console.log("Messages per second: " + (messagesReceived+'').green.bold);
    messagesReceived = 0;
}, 1000);
