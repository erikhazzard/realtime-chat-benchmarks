var sjsc = require('./sockjs-client-node');
var client = sjsc.create("http://localhost:8081/echo");

client.on('connection', function () { 
    console.log("connection is established");
});
client.on('data', function (msg) { 
    console.log("DATA");
});
client.on('error', function (e) { 
    console.log("ERROR");
});

client.write("Have some text you mighty SockJS server!");
