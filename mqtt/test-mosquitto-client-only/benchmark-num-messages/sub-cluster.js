/* =========================================================================
 *
 * sub.js 
 *  listens for messages
 *
 * ========================================================================= */
var mqtt = require('mqtt');
var colors = require('colors');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
function format (val){
    return Math.round(((val / 1024 / 1024) * 1000) / 1000) + 'mb';
}

if (cluster.isMaster) {
    var statsId = setInterval(function () {
        console.log('Memory Usage :: '.bold.green.inverse +
            ("\tRSS: " + format(process.memoryUsage().rss)).blue +
            ("\tHeap Total: " + format(process.memoryUsage().heapTotal)).yellow +
            ("\t\tHeap Used: " + format(process.memoryUsage().heapUsed)).magenta +
            "\n"
        );
    }, 1500);

    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    var client = mqtt.createClient(1883, 'localhost');
    var messagesReceived = 0;

    client.subscribe('presence');

    client.on('message', function (topic, message) {
        messagesReceived++;
    });

    var last = 0;
    setInterval(function (){
        console.log("(" + cluster.worker.id + ") Messages per second: " + 
            (messagesReceived+'').green.bold);

        last = messagesReceived;
        messagesReceived = 0;
    }, 1000);

    setInterval(function (){
        if(cluster.worker.id === 1){
            console.log("--------------------------------------- " + 
                (' '+(last*8)+' ').bold.green.inverse + 
                ' (average-ish) '.blue + "\n");
            last = 0;
        }
    }, 1050);
}
