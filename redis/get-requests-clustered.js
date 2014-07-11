/* =========================================================================
 *
 * get-requests.js 
 *  spins up a ton of amqp clients and waits for a message
 *
 * ========================================================================= */
var colors = require('colors');
var amqp = require('amqp');
var _ = require('lodash');
var d3 = require('d3');
var usage = require('usage');
var async = require('async');
var redis = require("redis");
var ss = require('simple-statistics');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

function format (val){
    return Math.round(((val / 1024 / 1024) * 1000) / 1000) + 'mb';
}

// configure 
var numConnections = process.argv.slice(2)[0] || 100;
var GET_DELAY = process.argv.slice(3)[0] || 1000;

var PORT = 6379;
var HOST = 'localhost';
if( process.argv.slice(4)[0] ) { HOST = process.argv.slice(4)[0]; }

var pid = process.pid;
var connectionStart = new Date();
var longestTime = 0;

// Launch 
// --------------------------------------
if (cluster.isMaster) {
    var clientsConnected = 0;
    var responseTimes = [];
    var getsRequested = 0;
    var worker;

    for (var i = 0; i < numCPUs; i++) { 
        worker = cluster.fork();
        worker.on('message', function(msg) {
            if (msg.clientsConnected !== undefined){
                clientsConnected++;

            } else if (msg.responseTime !== undefined){
                // when a response time message is received, the getsRequested
                // should increase along with checking for longest response time
                responseTimes.push(+msg.responseTime);
                if(+msg.responseTime > longestTime){ 
                    longestTime = +msg.responseTime;
                }
                getsRequested++;
            }
        });
    }

    // Show stats
    // --------------------------------------
    setInterval(function showStats(){
        console.log(('\nStats ========================== (Request every ' +
            GET_DELAY + ' ms)').inverse);
        console.log('\tClients connected: ' + 
            (''+d3.format(',')(clientsConnected)).bold.green.inverse);

        console.log('\tRunning Time: ' + (''+((new Date() - connectionStart)/1000)).cyan + ' seconds');
        console.log('\tGET requests: ' + 
            (''+d3.format(',')(getsRequested)).blue);

        console.log('\tAverage : ' + (ss.mean(responseTimes)+'').yellow + ' ms');
        console.log('\tLongest time: ' + (''+longestTime).red + ' ms');

        usage.lookup(pid, function(err, result) {
            console.log('\tStats: '.bold.green);
            if(result){ console.log('\t\tCPU %: ' +  result.cpu); }
            console.log('\t\tMemory Usage :: ' +
                ("RSS: " + format(process.memoryUsage().rss)).blue +
                ("\tHeap Total: " + format(process.memoryUsage().heapTotal)).yellow +
                ("\tHeap Used: " + format(process.memoryUsage().heapUsed)).magenta
            );
        });

    }, 1000);

} else {
    // Launch it
    var FINISHED_CONNECTING = false;

    console.log('Starting up : ' + (''+numConnections).inverse + ' clients...');
    async.eachLimit(
        _.range(numConnections), // array
        100, 
        function iterator(i, callback){
            // log some progress
            if(i % 1000 === 0){
                console.log(('\t > ' + i + ' clients connected').blue);
            }

            function connect(){
                var client = redis.createClient( PORT, HOST );

                client.on("error", function (err) {
                    console.log("Error " + err + ' (reconnecting...)');
                    connect();
                });

                client.on('connect', function (err){
                    process.send({ clientsConnected: 1 }); 

                    function makeGET(){
                        if(!FINISHED_CONNECTING){ return false; }

                        var getStart = new Date();
                        client.set("roomid", ''+Math.random(), function(){
                            var time = new Date() - getStart;
                            process.send({ responseTime: time });

                            getStart = new Date();
                        });
                    }
                    //ever 4 seconds make request
                    setInterval(makeGET, GET_DELAY);

                    //// finish up
                    setTimeout(callback, (80 * +cluster.worker.id));
                });
            }

            connect();
        }, 
        function allDone (err){
        }
    );
}
