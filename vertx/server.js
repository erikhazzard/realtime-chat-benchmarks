var vertx = require('vertx');
var container = require('vertx/container');
var console = require('vertx/console');

var port = 1234;

var server = vertx.createNetServer(),
    numClients = 0;

server.connectHandler(function(sock) {
    numClients++;
    console.log("A client has connected. Total number of clients: " + numClients);

    sock.dataHandler(function(buffer) {
        console.log("I received " + buffer.length() + " bytes of data");
    });

    sock.closeHandler(function() {
        console.log("This socket is now closed");
    });

    sock.exceptionHandler(function(ex) {
        console.error("Something went wrong: " + ex.getMessage());
    });
});

server.listen(port, 'localhost', function(err) {
    if (!err) {
        console.log('Now listening on port ' + port);
    }

    container.deployVerticle('clients.js', 10, function(err, deployID) {
        if (!err) {
            console.log("Verticle " + deployID + " has been deployed.");
        } else {
            console.log("Deployment failed: " + err.getMessage());
        }
    });
});