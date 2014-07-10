/* =========================================================================
 *
 * sub-cluster.js 
 *  listens for messages
 *
 * ========================================================================= */
var zmq = require('zmq');
var socket = zmq.socket('sub');
var colors = require('colors');
var port = 'tcp://127.0.0.1:12345';
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    socket.identity = 'subscriber' + process.pid;
    socket.connect(port);
    socket.subscribe('roomid');

    console.log('connected!');

    var messagesReceived = 0;

    var start = new Date();

    //setInterval(function (){
        //console.log("Messages per second: " + (messagesReceived+'').green.bold);
        //messagesReceived = 0;
    //}, 1000);

    socket.on('message', function(data) {
        messagesReceived++;
    });

    var closeEverything = function (){
        var now = new Date();
        console.log('\n Total time: ', ((now - start) / 1000));
        console.log('Total messages: ' + (''+messagesReceived).green);
        console.log('Messages per second: ' + (messagesReceived / ((now - start) / 1000)) );
        process.exit(1);
    };

    process.on('SIGINT', closeEverything);
    process.on('SIGTERM', closeEverything);
}
