/* =========================================================================
 *
 * pub.js 
 *  publishes messages
 *
 * ========================================================================= */
var mqtt = require('mqtt');
var colors = require('colors');

var client = mqtt.createClient(1883, 'localhost');

function pub (){
    client.publish('presence', 'Hello');
    setTimeout(function(){
        setImmediate(pub);
    }, 5000);
}
pub();
