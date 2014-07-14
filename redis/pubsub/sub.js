/* =========================================================================
 *
 * sub.js
 *  spawns some subscribers
 *
 * ========================================================================= */
var _ = require('lodash');
var colors = require('colors');
var d3 = require('d3');
var async = require('async');
var redis = require("redis");
var ss = require('simple-statistics');
var usage = require('usage');

function format (val){
    return Math.round(((val / 1024 / 1024) * 1000) / 1000) + 'mb';
}

// CONFIG
// --------------------------------------
var PORT = 6379;
var HOST = 'localhost';
var numConnections = process.argv.slice(2)[0] || 100;
var clientsConnected = 0;
var messagesReceviedByConn = {};

var rooms = ['r1', 'r2', 'r3', 'r4', 'r5'];

// Kick it off
// --------------------------------------
var pid = process.pid;
var connectionStart = new Date();
var numSubs = 0;
var FINISHED_CONNECTING = false;

async.eachLimit(
    _.range(numConnections), // array
    50, // limit
    function iterator(i, callback){
        if(i % 500 === 0){
            console.log(('\t > ' + i + ' clients connected').blue);
        }

        var closure = function (index){
            var client = redis.createClient(PORT, HOST);

            var curSubs = 0;
            client.on("subscribe", function (channel, count) {
                curSubs++;
                numSubs++;
                if(curSubs === rooms.length-1){
                    callback();
                }
            });

            client.on("message", function (channel, message) {
                if(messagesReceviedByConn[index]){
                    messagesReceviedByConn[index]++;
                } else { 
                    messagesReceviedByConn[index] = 1;
                }
            });

            // subscribe to rooms
            _.each(rooms, function(room){
                client.subscribe(room);
            });
        };
        closure(i);

    }, 
    function done(err){
        console.log('Done!');
        FINISHED_CONNECTING = true;
    }
);


// -------------------------------------------------------------------------
// Stat - logging
// -------------------------------------------------------------------------
setInterval(function showStats(){
    if(!FINISHED_CONNECTING){ return false; }

    console.log('\nStats ========================== '.inverse);
    console.log('\tClients connected: ' + 
        (''+d3.format(',')(numConnections)).bold.green.inverse);
    console.log('\tRunning Time: ' + (''+((new Date() - connectionStart)/1000)).cyan + ' seconds');

    console.log('\t Number of total subscriptions : ' + (''+numSubs).green);
    console.log('\t Number of total messages: ' + 
        (''+_.reduce(messagesReceviedByConn, function(a,b){return a+b;})).green
    );

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

// -------------------------------------------------------------------------
// close program
// -------------------------------------------------------------------------
var closeEverything = function(err) {
    process.exit(1);
};
process.on('SIGINT', closeEverything);
process.on('SIGTERM', closeEverything);
