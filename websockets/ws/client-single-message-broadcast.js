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

var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.File) ({
            filename: 'logs/clients-messages-single.log',
            level: 'verbose'
        })
    ]
});

var NUM_CONNECTIONS = 20000,
    NUM_CONCURRENT = 50,
    sockets = [],
    numMessagesReceived = 0;
    // messages = {};

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

    // send a message
    sockets[0].send("test");
    logger.verbose("test sent at " + (new Date()).getTime(), {
        message: "test",
        time: new Date().getTime()
    });
});
