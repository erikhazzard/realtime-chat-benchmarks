/* =========================================================================
 *
 * producer.js 
 *  sends messages. a consumer consumers them
 *
 * ========================================================================= */
var zmq = require('zmq');
var sock = zmq.socket('push');
var colors = require('colors');

sock.bindSync('tcp://127.0.0.1:3000');
console.log('Producer bound to port 3000'.green);

// Just start sending a bunch of messages
while(true){
    sock.send(''+(+new Date()));
}
