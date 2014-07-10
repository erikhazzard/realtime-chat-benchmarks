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
    winston = require('winston');

var numCPUs = require('os').cpus().length;

var totalClients = 0;
var msgReceived = 0;


function format (val){
    return Math.round(((val / 1024 / 1024) * 1000) / 1000) + 'mb';
}

function format2 (val){
    return val+ '';
}

if (cluster.isMaster) {
    var statsId = setInterval(function () {
        console.log('Memory Usage :: '.bold.green.inverse +
            ("\tRSS: " + format(process.memoryUsage().rss)).blue +
            ("\tHeap Total: " + format(process.memoryUsage().heapTotal)).yellow +
            ("\tHeap Used: " + format(process.memoryUsage().heapUsed)).magenta +
            ("\t\tNr Clients: " + format2(totalClients).white)+
            ("\t\tReceived Msg: " + msgReceived+"").cyan
        );
        
        msgReceived = 0;
    }, 1500);

    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();

        worker.on('message', function(msg) {
            if (msg.num) {
                totalClients += msg.num;
            }

            if (msg.msg){
                msgReceived += 1;
            }
        });
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker #' + worker.process.pid + ' died.');
    });

} else {


    var mosca = require('mosca'),
    workerId = cluster.worker.id;

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
        winston.info("Mosca server #" + workerId + " is up and running");
    });

    server.on('clientConnected', function(client) {
        totalClients++;
        process.send({ num: 1 });
        // console.log("Client #" + client.id + " connected to server. Num Clients : " + 
        //     totalClients); 
    });

    var start, end, maxNrItems;

    // fired when a message is received
    server.on('published', function(packet, client) {
        
        if(client){
            msgReceived++;
            process.send({ msg: 1 });
        }

    });

    server.on('clientDisconnected', function(client) {
        totalClients--;
        // console.log(
        //     ("Client #" + client.id + " connected to server. Num Clients : " + 
        //     totalClients).red); 
        process.send({ num: -1 });
    });

    server.on('error', function(err) {
        totalClients--;
        console.log("Error : num clients" + totalClients);
    });





}