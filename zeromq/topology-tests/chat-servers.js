/* =========================================================================
 *
 * sub.js 
 *  listens for messages
 *
 * ========================================================================= */
var zmq = require('zmq');
var colors = require('colors');

// CONFIG
// --------------------------------------
var NUM_ROOMS = 10;
var TOTAL_SENT = 0;
var TOTAL_RECEIVED = 0;

// pub 
// --------------------------------------
function pub (){
    var socket = zmq.socket('pub');
    var port = 'tcp://127.0.0.1:12345';

    socket.identity = 'publisher' + Math.random() + Math.random();

    var messagesSent = 0;
    var curRoomNum = 0;

    socket.bind(port, function (err) {
        console.log('bound!');

        function send (){
            socket.send('room' + curRoomNum);

            curRoomNum++;
            if(curRoomNum >= NUM_ROOMS){ curRoomNum = 0; }

            TOTAL_SENT++;
            setImmediate(send);
        }
        send();
    });
}
pub();

// sub 
// --------------------------------------
var roomNo = 0;

function sub (){
    var socket = zmq.socket('sub');
    var port = 'tcp://127.0.0.1:12345';

    socket.identity = 'subscriber' + Math.random() + Math.random();
    socket.connect(port);
    socket.subscribe('room' + roomNo);

    var curRoom = roomNo;

    roomNo++;

    console.log('connected!');

    var messagesReceived = 0;

    socket.on('message', function(data) {
        messagesReceived++;
        TOTAL_RECEIVED++;
    });

    setInterval(function (){
        console.log(curRoom + " : Messages per second: " + (messagesReceived+'').green.bold);
        messagesReceived = 0;
    }, 1000);
}

setInterval(function (){
    var percent = ((TOTAL_RECEIVED / TOTAL_SENT) * 100);
    var percentString = percent + '%';

    if(percent < 70){ 
        percentString = percentString.red;
    } else if(percent < 90){ 
        percentString = percentString.bold.yellow;
    } else if( percent < 100){
        percentString = percentString.yellow;
    } else if (percent === 100){
        percentString = percentString.green;
    } else if ( percent > 100){
        percentString = percentString.red;
    }

    console.log('--------------------------------------------------'); 
    console.log('Message Stats...'.blue);
    console.log('\nTotal Sent: ' + TOTAL_SENT + 
        ' \t Total Received: ' + TOTAL_RECEIVED);
    console.log('\nReceive Rate: ' + percentString + ' \t ' +
        (TOTAL_SENT - TOTAL_RECEIVED) + ' dropped messages');
    console.log('--------------------------------------------------'); 

    TOTAL_SENT = 0;
    TOTAL_RECEIVED = 0;
}, 1100);

// Spawn some subs
for(var i=0; i<NUM_ROOMS; i++){
    sub();
}
