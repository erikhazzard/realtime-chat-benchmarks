/**
 *
 *  client-single-rooms-messages
 *
 *  Creates a bunch of connections using a single node process and
 *  splits up sockets into rooms with a max of 6 connections per
 *  room. Then messages are sent out intermittently
 *
 */

var async = require('async');
var sjsc = require('sockjs-client-ws');
var _ = require('lodash');
var winston = require('winston');
var logMemUsage = require('../../util/mem-usage');
var colors = require('colors');

var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.File) ({
            filename: 'logs/client-broadcast-back-single.log',
            level: 'verbose'
        })
    ]
});

logMemUsage(1500);

    // Number of connections to create
var NUM_CONNECTIONS = 20000,
    // Number of clients to be concurrently sending out messages
    NUM_CONCURRENT_SENDERS = 10,
    socketUri = "http://localhost:9999/",
    // array of clients
    clients = [],
    messages = {};

async.eachLimit(_.range(NUM_CONNECTIONS), NUM_CONNECTIONS / 40, function(i, cb) {
    var roomId = Math.floor(i / 6),
        roomUri = socketUri + roomId;

        // Create a socket for each room
    var client = clients[i] = sjsc.create(roomUri);

    client.on('connection', function setupConnection() {
        console.log("Connected client #" + i + " to room #" + roomId);

        // When the connection is first established, first send over the
        // room and socket information so that the server can properly create
        // a queue/exchange on RabbitMQ
        client.write(JSON.stringify({
            roomId: roomId,
            socketId: i
        }));

        setTimeout(function() {
            // Done connecting, start the next one
            cb();
        }, 2500);
    });

    client.on('data', function(data) {
        // When a message is received, nothing happens
        // We log it now to have an understanding of how much time
        // it takes for a message to be sent to all participants in a room
        // Expects data to be a stringified JSON obj
        var parsed = JSON.parse(data);

        logger.verbose("Message received from server from room " + parsed.roomId, {
            room: parsed.roomId,
            time: new Date().getTime()
        });

        console.log("Data received on client " + i + ": " + data);
    });

    client.on('error', function(e) {
        console.log("Something went wrong...");
    });

}, function onFinishConnectingClients() {
    // When all of the clients have been connected, routinely
    // sent out a bunch of messages with timeouts and intervals
    console.log("Done connecting " + NUM_CONNECTIONS + " connections.");

    // Just initialize with w/e
    var roomId = 0,
        socketId = 10;

    for (var i = 0; i < NUM_CONCURRENT_SENDERS; i++) {
        setTimeout(function() {
            setInterval(function() {
                var time = new Date().getTime();

                clients[socketId].send(JSON.stringify({
                    roomId: roomId,
                    time: time,
                    message: "Hello world"
                }));

                logger.verbose("Message sent from room #" + roomId, {
                    room: roomId,
                    time: time
                });

                socketId = (socketId + 1) % clients.length;
                roomId = (roomNum + 1) % Math.floor(clients.length / 6);
            });
        });
    }
});