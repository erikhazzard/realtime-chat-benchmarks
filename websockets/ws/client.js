var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:3000/', {
    protocolVersion: 8,
    origin: 'http://localhost:3000'
});

// Setup connections, open connection
ws.on('open', function() {
    console.log('connected');
    // send a message on connection
    ws.send(''+(+Date.now()), {mask: true});
});
ws.on('message', function(data, flags) {
    console.log('Roundtrip time: ' +
        ( Date.now() - new Date(+data) ) +
        'ms',
        flags
    );

    // send a message after some time
    setTimeout(function() {
        ws.send(Date.now().toString(), {mask: true});
    }, 500);
});

ws.on('close', function() {
    console.log('disconnected');
});
