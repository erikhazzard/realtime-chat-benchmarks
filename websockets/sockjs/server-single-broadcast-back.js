/**
 *
 *  server-single-broadcast-back
 *
 *  Single SockJS sever that broadcasts all messages received to all connected
 *  clients
 *
 */

var http = require('http');
var sockjs = require('sockjs');
var sockServer = sockjs.createServer();
var logMemUsage = require('../../util/mem-usage');
var colors = require('colors');

logMemUsage(1500);

var numCloses = 0,
    numErrors = 0;

sockServer.on('connection', function(conn) {
    this.clients = this.clients || [];
    this.clients.push(conn);
    var numClients = this.clients.length;

    if (numClients % 500 === 0) {
        console.log(("Client connected! Total: " + numClients).green);
    }

    conn.on('data', function(data) {
        // Relay message back
        if (sockServer.broadcast) {
            sockServer.broadcast(data);
        }
    });

    conn.on('close', function() {
        numCloses++;
        console.log(("Client closed. Total: " + numCloses).red);
    });

    conn.on('error', function() {
        numErrors++;
    });

});

var server = http.createServer();

console.log("SockJS server starting...".yellow);
console.log("=============================================".yellow);

sockServer.installHandlers(server, {prefix: '/test'});
server.listen(9999, '0.0.0.0');

sockServer.broadcast = function(data) {
    if (this.clients) {
        for (var i in this.clients) {
            this.clients[i].write(data);
        }
    } else {
        this.clients = [];
    }
};