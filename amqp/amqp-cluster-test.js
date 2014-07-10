/**
 *
 *  amqp-cluster-test
 *
 *  Tests node cluster usage with AMQP
 *
 */

 var async = require('async');
 var _ = require('lodash');
 var cluster = require('cluster');
 var numCPUs = require('os').cpus().length;
 var amqp = require('amqp');
 var WebSocketServer = require('ws').Server;

// Establish _one_ connection for use by all node processes
 var connection = amqp.createConnection({
    host: 'localhost'
 });

 connection.on('ready', function() {
    // When the connection is ready we can begin forking workers
    console.log("AMQP connection ready");

    if (cluster.isMaster) {
        // Master process

    } else {

    }
 });