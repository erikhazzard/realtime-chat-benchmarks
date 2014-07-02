var WebSocketServer = require('ws').Server, 
    wsServer = new WebSocketServer({port: 3000});

var numClients = 0;

wsServer.on('connection', function(ws) {
    numClients++;
    console.log("Client connected! : ", numClients);

    ws.on('message', function(message) {
        console.log('received: %s', message);
    });

    //// Send a message...
    //ws.send('something');
});
