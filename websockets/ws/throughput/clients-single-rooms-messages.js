/* =========================================================================
 *
 *  client-single-rooms-messages
 *
 *  Creates a lot of connections, connects them to a WebSocket, and sends
 *  information 'to the room' to be sent to all of the other clients in the
 *  same room.
 *
 *  The script then logs the time difference between when the message was sent
 *  and when the message was received by all of the clients.
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

var returnTimes = {};

    // Total # connections
var NUM_CONNECTIONS = process.argv[2] || 2000,
    MAX_ITERATIONS = process.argv[3] || 10,
    NUM_CONCURRENT_SENDERS = 300,
    DELAY_BETWEEN_CONCURRENT_SENDERS = 20,
    NUM_PEOPLE_IN_ROOM = 6,
    MAX_NUM_MESSAGES = 100000,
    LOG_FILE_PATH = 'logs/throughput.log',
    sockets = [],
    messages = {};

logMemUsage(1500);

var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.File) ({
            filename: LOG_FILE_PATH,
            level: 'verbose'
        })
    ]
});

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
        var roomId = Math.floor(i / NUM_PEOPLE_IN_ROOM),
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
                ' | Num connections : ' + (''+sockets.length).blue);

            // continue
            setTimeout(function(){
                console.log('\t calling callback...');
                cb();
            }, 300);
        });

        ws.on('message', function(data, flags) {
            // When a message is received, nothing happens
            // irl the client should update its view or somethin
            var parsed = JSON.parse(data),
                roomId = parsed.roomId,
                time = parsed.time;

            if (returnTimes[roomId]) {
                returnTimes[roomId]++;
                console.log(returnTimes[roomId]);

                if (returnTimes[roomId] >= NUM_PEOPLE_IN_ROOM) {
                    // All of the clients in the room have received messages
                    // log difference b/n current time and msg time
                    var timeDiff = new Date().getTime() - time;
                    fs.appendFile(LOG_FILE_PATH, roomId + "\t" + timeDiff + "\n",
                        function(err) {
                            if (err) return console.log(err);
                    });
                }
            } else {
                returnTimes[roomId] = 1;
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

    /*
    // Have concurrent messengers
    for (var i = 0; i < NUM_CONCURRENT_SENDERS; i++) {
        setTimeout(function() {
            var sendInterval = setInterval(function() {
                if (numMessagesSent > MAX_NUM_MESSAGES) {
                    setTimeout(function() {
                        console.log("Max number of messages sent, closing...");
                        process.exit(1);
                    });
                } else {
                    sendMessage();
                }
            }, DELAY_BETWEEN_CONCURRENT_SENDERS * NUM_CONCURRENT_SENDERS);
        }, DELAY_BETWEEN_CONCURRENT_SENDERS * i);
    }
    */
});