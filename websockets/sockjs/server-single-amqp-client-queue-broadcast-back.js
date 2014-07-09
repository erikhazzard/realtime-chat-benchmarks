/**
 *
 *  server-single-amqp-client-queue-broadcast-back
 *
 *  Single SockJS server that broadcasts all messages back to the clients in
 *  the room that the sender of the message is currently in.
 *
 *  Uses AMQP ?
 *
 */

var http = require('http');
var sockjs = require('sockjs');
var sockServer = sockjs.createServer();
var logMemUsage = require('../../util/mem-usage');
var colors = require('colors');
var amqp = require('amqp');

logMemUsage(1500);

var numClients = 0,
    numCloses = 0,
    numErrors = 0;

sockServer.on('connection', function(conn) {
    this.clients = this.clients || [];
    this.clients.push(conn);

    numClients++;
    if (numClients % 500 === 0) {
        console.log(("Client connected! Total: " + numClients).green);
    }

    conn.on('data', function(msg) {
        // Relay message back
        if (sockServer.broadcast) {
            sockServer.broadcast(msg);
        }
    });

    conn.on('close', function() {
        numClients--;
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