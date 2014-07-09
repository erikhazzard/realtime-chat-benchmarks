/* =========================================================================
 *
 * consumer.js 
 *  consumes messages sent by producer
 *
 * ========================================================================= */
var zmq = require('zmq');
var sock = zmq.socket('pull');
var colors = require('colors');

sock.connect('tcp://127.0.0.1:3000');
console.log('Worker connected to port 3000'.green);

var messagesReceived = 0;

sock.on('message', function (msg){
    // Get messages, don't log anything
    messagesReceived++;
});

setInterval(function (){
    console.log("Messages per second: " + (messagesReceived+'').green.bold);
    messagesReceived = 0;
}, 1000);
