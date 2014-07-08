/* =========================================================================
 *
 * producer.js 
 *  sends messages. a consumer consumers them
 *
 * ========================================================================= */
var zmq = require('zmq');
var colors = require('colors');

var socket = zmq.socket('pub');
var port = 'tcp://127.0.0.1:12345';

socket.identity = 'publisher' + process.pid;

var messagesSent = 0;

socket.bind(port, function(err) {
    console.log('bound!');

    setInterval(function (){
        console.log("Messages per second: " + (messagesReceived+'').green.bold);
        messagesSent = 0;
    }, 1000);

    while(true){
        socket.send('roomid: ' + +new Date());
        messagesSent++;
    }
});
