/* =========================================================================
 *
 *  mqtt/server.js
 *
 *  Sets up a MQTT server using mosca
 *
 *
 * ========================================================================= */
var cluster = require('cluster');
var colors = require('colors');

var totalClients = 0;

function format (val){
    return Math.round(((val / 1024 / 1024) * 1000) / 1000) + 'mb';
}

var statsId = setInterval(function () {
    console.log('Memory Usage :: '.bold.green.inverse +
        ("\tRSS: " + format(process.memoryUsage().rss)).blue +
        ("\tHeap Total: " + format(process.memoryUsage().heapTotal)).yellow +
        ("\t\tHeap Used: " + format(process.memoryUsage().heapUsed)).magenta
    );
}, 1500);


var mosca = require('mosca');

var ascoltatore = {
    type: 'amqp',
    json: false,
    amqp: require('amqp'),
    exchange: 'ascolatore5672'
};

var settings = {
    port: 8883,
    backend: ascoltatore
};

var server = new mosca.Server(settings);

server.on('ready', function setup() {
    console.log("Mosca server is up and running");
});

server.on('clientConnected', function(client) {
    totalClients++;
    console.log("Client #" + client.id + " connected to server. Num Clients : " + 
        totalClients); 
});

server.on('clientDisconnected', function(client) {
    totalClients--;
    console.log(
        ("Client #" + client.id + " connected to server. Num Clients : " + 
        totalClients).red); 
});

server.on('error', function(err) {
    totalClients--;
    console.log("Error : num clients" + totalClients);
});
