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
var async = require('async');
var redis = require("redis");
var ss = require('simple-statistics');

// configure 
var numConnections = process.argv.slice(2)[0] || 100;
var clientsConnected = 0;
var GET_DELAY = 1000;
var responseTimes = [];

// Launch it
// --------------------------------------
var getsRequested = 0;
var longestTime = 0;
var FINISHED_CONNECTING = false;

console.log('Starting up : ' + (''+numConnections).inverse + ' clients...');
var connectionStart = new Date();

async.eachLimit(
    _.range(numConnections), // array
    100, // limit
    function iterator(i, callback){
        // log some progress
        if(i % 1000 === 0){
            console.log(('\t > ' + i + ' clients connected').blue);
        }

        var client = redis.createClient();
        client.on("error", function (err) {
            console.log("Error " + err);
        });

        client.on('connect', function (err){
            clientsConnected++;

            function makeGET(){
                if(!FINISHED_CONNECTING){ return false; }

                var getStart = new Date();
                client.set("roomid", ''+Math.random(), function(){
                    getsRequested++;

                    var time = new Date() - getStart;
                    responseTimes.push(time);
                    if(time > longestTime){ longestTime = time; }

                    getStart = new Date();
                });
            }
            //ever 4 seconds make request
            setInterval(makeGET, GET_DELAY);

            // finish up
            callback();
        });
    }, 
    function allDone (err){
        console.log(
            ('All ' + numConnections + ' clients connected in ').green +
            (' '+(new Date() - connectionStart)+' ').green.inverse + 
            ' ms'.green
        );

        // Show stats
        // --------------------------------------
        setInterval(function showStats(){
            FINISHED_CONNECTING = true;

            console.log(('\nStats ========================== (Request every ' +
                GET_DELAY + ' ms)').inverse);
            console.log('\tClients connected: ' + 
                (''+d3.format(',')(clientsConnected)).bold.green);
            console.log('\tRunning Time: ' + (''+((new Date() - connectionStart)/1000)).cyan + ' seconds');
            console.log('\tGET requests: ' + 
                (''+d3.format(',')(getsRequested)).blue);
            console.log('\tAverage : ' + (ss.mean(responseTimes)+'').yellow + ' ms');
            console.log('\tLongest time: ' + (''+longestTime).red + ' ms');
        }, 1000);
    }
);
