var express = require('express');
var sockjs = require('sockjs');
var http = require('http');

// Sockjs server
var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};
var sockjs_chat = sockjs.createServer(sockjs_opts);
sockjs_chat.on('connection', function(conn) {
    // When we receive a message from browser, send it to be published
    conn.on('data', function(message) {
        console.log(">>>", message);
    });
});

// Express server
var app = express();
var server = http.createServer(app);

sockjs_chat.installHandlers(server, {prefix:'/chat'});

console.log(' [*] Listening on 0.0.0.0:3000' );
server.listen(3000, '0.0.0.0');

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});
