/* =========================================================================
 *
 * pub-cluster.js 
 *  publishes messages
 *
 * ========================================================================= */
var mqtt = require('mqtt');
var colors = require('colors');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    var client = mqtt.createClient(1883, 'localhost');
    console.log('Worker: ' + cluster.worker.id);

    var pub = function pub (){
        client.publish('presence', 'Hello');
        setImmediate(pub);
    };
    pub();

}
