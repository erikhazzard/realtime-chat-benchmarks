var WebSocketServer = require('ws').Server, 
    wsServer = new WebSocketServer({port: 3000});

var numClients = 0;

console.log("Server starting");

wsServer.on('connection', function(ws) {
    numClients++;
    console.log("Client connected! : ", numClients);

    ws.on('message', function(message) {
        console.log('received message: %s', message);
    });

    //// Send a message...
    //ws.send('something');
});
