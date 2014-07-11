/* =========================================================================
 *
 *  client-single-message-broadcast
 *
 *  Creates/connects a bunch of clients to the server and then sends one
 *  message to see how long it takes for that message to be broadcast to all
 *  connected clients.
 *
 *
 * ========================================================================= */
var colors = require('colors');
var async = require('async');
var _ = require('lodash');
var winston = require('winston');
var WebSocket = require('ws');
var colors = require('colors');
var logMemUsage = require('../../util/mem-usage');

var NUM_CONNECTIONS = process.argv[2] || 2000,
    MAX_ITERATIONS = process.argv[3] || 10,
    NUM_CONCURRENT_SENDERS = 300,
    DELAY_BETWEEN_CONCURRENT_SENDERS = 20,
    NUM_PEOPLE_IN_ROOM = 6,
    MAX_NUM_MESSAGES = 100000,
    LOG_FILE_PATH = 'logs/amqp-rooms-messasges.log',
    sockets = [],
    messages = {};

var NUM_CONNECTIONS = 20000,
    MAX_ITERATIONS = process.argv[3] || 10,
    NUM_CONCURRENT = 50,
    sockets = [],
    numMessagesReceived = 0;
    // messages = {};

var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.File) ({
            filename: 'logs/clients-messages-single.log',
            level: 'verbose'
        })
    ]
});

logMemUsage(1500);

var numConnections = 0;

process.on('uncaughtException', function (err) {
    console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
    console.log('\tUNCAUGHT EXCEPTION'.yellow);
    console.log(err);
    console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
});

// Spawn connections
// --------------------------------------
async.eachLimit(_.range(NUM_CONNECTIONS), 2000, function (i, cb) {
    try {
        var ws = sockets[i] = new WebSocket('ws://localhost:3000/', {
            protocolVersion: 8,
            origin: 'http://localhost:3000'
        });

        console.log(('Connecting ('+i+')').grey);

        // Setup connections, open connection
        ws.on('open', function () {
            numConnections++;
            console.log('Connected'.green.bold +
                ' | Num connections : ' + (''+numConnections).blue);

            // continue
            setTimeout(function(){
                console.log('\t calling callback...');
                cb();
            }, 300);
        });

        ws.on('message', function(data, flags) {
            // When a message is received, keep track of how many messages
            // have been received. When it's >= NUM_CONNECTIONS, we know that
            // all of the clients have received the broadcast
            // Since we're only broadcasting one message we don't actually
            // need to keep track of what the message was

            // console.log("Client received data: " + data);

            numMessagesReceived++;
            if (numMessagesReceived >= NUM_CONNECTIONS) {
                logger.verbose("Finished receiving " + data, {
                    message: data,
                    time: new Date().getTime()
                });
            }

            /*
            if (messages[data]) {
                messages[data] = messages[data] + 1;
                // console.log("Total number of messages received for " + data + ": " + messages[data]);

                if (messages[data] >= NUM_CONNECTIONS) {
                    logger.verbose("Finished receiving " + data + " at " + (new Date()).getTime(), {
                        message: data,
                        time: new Date().getTime()
                    });
                }
            } else {
                messages[data] = 1;
            }
            */
        });

        ws.on('close', function onSocketClose() {
            console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
            console.log('\tDisconnected'.red);
            console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
        });
    } catch(err) {
        console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
        console.log('\tUncaught error connecting to WebSocket'.yellow);
        console.log(err+'');
        console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
    }
}, function() {
    // Callback when the async call is finished
    console.log(("Done connecting " + NUM_CONNECTIONS + " connections.").yellow);

    var roomId = 0,
        socketId = 0,
        numMessagesSent = 0,
        TIME_TO_WAIT_MSG_SENDING = 500;

    var sendMessage = function() {
        // Send a message with a room ID

        // Send the current time to the socket to compute the time it
        // takes for the message to go to all clients in the room
        sockets[socketId].send(JSON.stringify({
            roomId: roomId,
            time: new Date().getTime(),
            message: 'hello world'
        }));

        socketId = (socketId + NUM_PEOPLE_IN_ROOM) % sockets.length;
        roomId = (roomId + 1) % Math.floor(sockets.length / NUM_PEOPLE_IN_ROOM);
    };

    setTimeout(function(){
        // NUM_CONCURRENT_SENDERS = broadcastClients.length;
        var client_iterations = [];
        var intervalIds = [];

        for (var i = 0; i < NUM_CONCURRENT_SENDERS; i++) {
            client_iterations.push(0);
            setTimeout(function (index){
                return function (){
                    var timerId = setInterval(function (index_inner){
                            return function () {
                                if (client_iterations[index_inner] < MAX_ITERATIONS) {
                                    console.log("Message", index_inner);
                                    //console.log("Index", index_inner)
                                    sendMessage();
                                    // var client = broadcastClients[index_inner];
                                    //client.publish(client.roomId, "Hello World");
                                    client_iterations[index_inner] += 1;
                                } else {
                                  console.log("Cleared Interval")
                                  clearInterval(intervalIds[index_inner]);
                                  if (index_inner == MAX_ITERATIONS) {
                                    setTimeout(function(d, i){
                                        console.log("Finished");
                                        process.exit(0);
                                    }, 1000);
                                  }
                                }
                            }
                    }(index), DELAY_BETWEEN_CONCURRENT_SENDERS * NUM_CONCURRENT_SENDERS);
                    intervalIds.push(timerId);
                };
            }(i), DELAY_BETWEEN_CONCURRENT_SENDERS * i);
        }
    }, TIME_TO_WAIT_MSG_SENDING);
});
