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

var numCPUs = require('os').cpus().length;
var totalClients = 0;

function format (val){
    return Math.round(((val / 1024 / 1024) * 1000) / 1000) + 'mb';
}

if (cluster.isMaster) {
    var statsId = setInterval(function () {
        console.log('Memory Usage :: '.bold.green.inverse +
            ("\tRSS: " + format(process.memoryUsage().rss)).blue +
            ("\tHeap Total: " + format(process.memoryUsage().heapTotal)).yellow +
            ("\t\tHeap Used: " + format(process.memoryUsage().heapUsed)).magenta
        );
    }, 1500);

    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();

        worker.on('message', function(msg) {
            if (msg.num) {
                totalClients++;
                console.log("Total # clients: " + totalClients);
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
        console.log("Mosca server #" + workerId + " is up and running");
    });

    server.on('clientConnected', function(client) {
        console.log("Client #" + client.id + " connected to server #" + workerId);
        process.send({ num: 1 });
    });

    server.on('published', function(packet, client) {
        if (client) {
            console.log("Client #" + client.id + " published: " + packet.payload);
        }
    });

    server.on('error', function(err) {
        console.log("Error");
    });
}