/* =========================================================================
 *
 *  client-single-rooms-feed
 *
 *  Constructs a set number of rooms and assigns a bunch of sockets to those
 *  rooms
 *
 * ========================================================================= */
var colors = require('colors');
var async = require('async');
var _ = require('lodash');
var winston = require('winston');
var WebSocket = require('ws');
var colors = require('colors');
var fs = require('fs');
var logMemUsage = require('../../../util/mem-usage');

    // Total # connections
var NUM_CONNECTIONS = 20000,
    NUM_ROOMS = 10,
    LOG_FILE_PATH = 'logs/amqp-rooms-feed.log',
    sockets = [],
    messages = {};

var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.File) ({
            filename: LOG_FILE_PATH,
            level: 'verbose'
        })
    ]
});

logMemUsage(1500);

process.on('uncaughtException', function (err) {
    console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
    console.log('  UNCAUGHT EXCEPTION '.yellow);
    console.log(err+'');
    console.log('xxxxxxxxxxxxxxxxxx'.bold.yellow);
});

// Prepare log file
fs.writeFile(LOG_FILE_PATH, "ROOM_ID\tTIME_DIFF\n", function (err) {
  if (err) return console.log(err);
});

// Spawn connections
// --------------------------------------
async.eachLimit(_.range(NUM_CONNECTIONS), 2000, function (i, cb) {
    try {
        // Just use floor(i / 6) as room ID for now; ensures
        // at most 6 in a room
        var roomId = i % NUM_ROOMS;
            roomUri = 'ws://localhost:3000/' + roomId;
        var ws = sockets[i] = new WebSocket(roomUri, {
            protocolVersion: 8,
            origin: 'http://localhost:3000'
        });

        console.log(('Connecting ('+i+') to room #' + roomId + '...').grey);

        // Setup connections, open connection
        ws.on('open', function setupConnection() {
            // When the connection is first established, need to send over the
            // room so that the server can properly create a queue/exchange
            ws.send(JSON.stringify({
                roomId: roomId,
                socketId: i
            }));

            console.log('Connected'.green.bold +
                ' | Num connections : ' + (''+ sockets.length).blue);

            // continue
            setTimeout(function (){
                console.log('\t calling callback...');
                cb();
            }, 700);
        });

        ws.on('message', function(data, flags) {
            // When a message is received, nothing happens
            // irl the client should update its view or somethin
            var parsed = JSON.parse(data),
                roomId = parsed.roomId,
                content = parsed.content,
                time = parsed.time,
                timeDiff = new Date().getTime() - time;

            if (messages[roomId]) {
                messages[roomId]++;

                if (messages[roomId] >= NUM_CONNECTIONS / NUM_ROOMS) {
                    fs.appendFile(LOG_FILE_PATH, roomId + "\t" + timeDiff + "\n",
                        function (err) {
                            if (err) return console.log(err);
                        });
                }
            } else {
                messages[roomId] = 1;
            }

            console.log("Message received from server: " + data);
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

    var roomId = 0,
        socketId = 0;

    // send a bunch of messages every second
    setInterval(function() {
        sockets[socketId].send(JSON.stringify({
            roomId: roomId,
            time: new Date().getTime(),
            socketId: socketId,
            message: 'hello world'
        }));

        socketId = (socketId + 1) % sockets.length;
        roomId = (roomId + 1) % NUM_ROOMS;
    }, 2000);
});
