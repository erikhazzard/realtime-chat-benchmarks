/* =========================================================================
 *
 * producer.js 
 *  sends messages. a consumer consumers them
 *
 * ========================================================================= */
var zmq = require('zmq');
var socket = zmq.socket('sub');
var colors = require('colors');
var port = 'tcp://127.0.0.1:12345';

socket.identity = 'subscriber' + process.pid;
socket.connect(port);
socket.subscribe('roomid');

console.log('connected!');

var messagesReceived = 0;

socket.on('message', function(data) {
    messagesReceived++;
    setTimeout(function(){}, 1000);
});

setInterval(function (){
    console.log("Messages per second: " + (messagesReceived+'').green.bold);
    messagesReceived = 0;
}, 1000);
