/* =========================================================================
 *
 * pub.js
 *  spawns some subscribers
 *
 * ========================================================================= */
var _ = require('lodash');
var colors = require('colors');
var d3 = require('d3');
var async = require('async');
var redis = require("redis");
var PORT = 6379;
var HOST = 'localhost';
var rooms = ['r1', 'r2', 'r3', 'r4', 'r5'];
var numConnections = process.argv.slice(2)[0] || 1;

// Publish messages
// --------------------------------------
async.eachLimit(
    _.range(numConnections), // array
    50, // limit
    function iterator(i, callback){
        var client = redis.createClient(PORT, HOST);

        // subscribe to rooms
        _.each(rooms, function(room){
            client.publish(room, 'Hello world');
        });

        setTimeout(function(){
            callback();
        }, 1000);
    },
    function done(){
        console.log('Done!');
        process.exit(1);
    }
);

// close program
var closeEverything = function(err) {
    process.exit(1);
};
process.on('SIGINT', closeEverything);
process.on('SIGTERM', closeEverything);
