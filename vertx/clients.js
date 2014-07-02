var vertx = require('vertx');
var container = require('vertx/container');
var console = require('vertx/console');

var port = 1234,
    NUM_CLIENTS = 500;


for (var i = 0; i < NUM_CLIENTS; i++) {
    var client = vertx.createNetClient();

    client.connect(port, 'localhost', function(err, sock) {
        if (err) {
            console.log(err.getMessage());
        }
    });
}