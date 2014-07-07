/* =========================================================================
 *
 *  client-messages-single
 *  establishes a single connection and sends a message intermittently
 *  between clients after all clients have connected, logging data to
 *  a log located in ./logs/
 *
 *
 * ========================================================================= */
var colors = require('colors');
var async = require('async');
var _ = require('lodash');
var winston = require('winston');
var WebSocket = require('ws');
var colors = require('colors');

var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.File) ({
            filename: 'logs/clients-messages-single.log',
            level: 'verbose'
        })
    ]
});

var NUM_CONNECTIONS = 2000,

    // number of messages to send
    NUM_MESSAGES = 3000,
    NUM_CONCURRENT = 50,
    sockets = [],
    messages = {};

// Stats overview
// --------------------------------------
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

var numConnections = 0;

process.on('uncaughtException', function (err) {
    console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
    console.log('  UNCAUGHT EXCEPTION '.yellow);
    console.log(err+'');
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
            // console.log("Client received data: " + data);

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
                // console.log(messages);
            }
        });

        ws.on('close', function () {
            console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
            console.log('  Disconnected'.red);
            console.log('xxxxxxxxxxxxxxxxxx'.bold.red);
        });
    } catch(err) {
        console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
        console.log('  UNCAUGHT ERROR CONNECTING TO WEBSOCKET '.yellow);
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

    // now send a bunch of random messages back and forth
    /*
    async.eachLimit(_.range(30), 10, function(i, cb) {
        setInterval(function() {
            sockets[i].send("test" + i);
            logger.verbose("test" + i + " sent at " + (new Date()).getTime());
            cb();
        });
    });
*/
});
