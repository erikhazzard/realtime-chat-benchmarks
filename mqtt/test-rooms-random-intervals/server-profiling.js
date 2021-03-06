/* =========================================================================
 *
 *  mqtt/server.js
 *
 *  Sets up a MQTT server using mosca
 *
 *
 * ========================================================================= */
var cluster = require('cluster'),
    colors = require('colors'),
    winston = require('winston'),
    fs = require('fs');


var logFilePathMgAvg = './logs/messageAvg.log';
var totalClients = 0;
var msgReceived = 0;


function format (val){
    return Math.round(((val / 1024 / 1024) * 1000) / 1000) + 'mb';
}

function format2 (val){
    return val+ '';
}

var statsId = setInterval(function () {
    console.log('Memory Usage :: '.bold.green.inverse +
        ("\tRSS: " + format(process.memoryUsage().rss)).blue +
        ("\tHeap Total: " + format(process.memoryUsage().heapTotal)).yellow +
        ("\tHeap Used: " + format(process.memoryUsage().heapUsed)).magenta +
        ("\t\tNr Clients: " + format2(totalClients).white)+
        ("\t\tReceived Msg: " + msgReceived+"").cyan


    );

    fs.appendFile(logFilePathMgAvg, msgReceived+"\n", function (err) { if (err) return console.log(err);});

    msgReceived = 0;
    
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
    winston.info("Mosca server is up and running");
});

server.on('clientConnected', function(client) {
    totalClients++;
    // console.log("Client #" + client.id + " connected to server. Num Clients : " + 
    //     totalClients); 
});

var start, end, maxNrItems;

// fired when a message is received
server.on('published', function(packet, client) {
    
    if(client){
        msgReceived++;
    }

});

server.on('clientDisconnected', function(client) {
    totalClients--;
    // console.log(
    //     ("Client #" + client.id + " connected to server. Num Clients : " + 
    //     totalClients).red); 
});

server.on('error', function(err) {
    totalClients--;
    console.log("Error : num clients" + totalClients);
});





