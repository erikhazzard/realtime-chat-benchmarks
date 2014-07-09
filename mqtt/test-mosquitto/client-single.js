/* =========================================================================
 *
 * clients
 *  Starts multiple clients asynchronously and connects all of them to a
 *  channel
 *
 *
 * ========================================================================= */

var mqtt = require('mqtt'),
    cluster = require('cluster'),
    async = require('async'),
    colors = require('colors'),
    winston = require('winston'),
    _ = require('lodash'),
    numCPUs = require('os').cpus().length;



var client = mqtt.createClient(8884, 'localhost');

client.on('error', function(e) {
    winston.error("Error");
});

client.subscribe("hello");


client.on('connect', function(){
    console.log("connected");
    client.publish("hello", "helllllllllo world");
});



