/**
 *
 *  simple-server
 *
 *  Single SockJS echo server
 *
 */

var http = require('http');
var sockjs = require('sockjs');
var echo = sockjs.createServer();
var logMemUsage = require('../../util/mem-usage');
var colors = require('colors');

logMemUsage(1500);

var numClients = 0,
    numCloses = 0,
    numErrors = 0;

echo.on('connection', function(conn) {
    numClients++;
    if (numClients % 500 === 0) {
        console.log(("Client connected! Total: " + numClients).green);
    }

    conn.on('data', function(msg) {
        // Relay message back
        conn.write(msg);
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

echo.installHandlers(server, {prefix: '/echo'});
server.listen(9999, '0.0.0.0');

