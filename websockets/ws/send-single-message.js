/* =========================================================================
 *
 * send-single-message
 *  establishes a single connection and sends a message
 *
 *
 * ========================================================================= */
var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:3000/', {
    protocolVersion: 8, 
    origin: 'http://localhost:3000'
});
var colors = require('colors');

console.log('Connecting...'.grey);

// When a message is received from the server, log the roundtrip time and send
// another one
ws.on('message', function(data, flags) {
    console.log('\tReceived message : '.green.bold +
        (( Date.now() - new Date(+data) ) + 'ms').magenta
    );

    // send a message after some time
    setTimeout(function() {
        console.log('Sending message...'.blue);
        ws.send(''+(+Date.now()), {mask: true});
    }, 500);
});

// Setup connections, open connection
ws.on('open', function() {
    console.log('Connected'.green.bold + ' | sending message...');

    // send a message on connection
    ws.send(''+(+Date.now()), {mask: true});
});

ws.on('close', function() {
    console.log('Disconnected');
    process.exit(1);
});
