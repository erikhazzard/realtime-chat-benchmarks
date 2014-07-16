/* =========================================================================
 * 
 * client-simple.js
 *  Simple eventsource client
 *
 *  ======================================================================== */
var EventSource = require('eventsource');


console.log("Creates client")

var es = new EventSource('http://localhost:8010/eventsource');
//var es = new EventSource('http://127.0.0.1:8010/sse');

// Message callbacks
es.onmessage = function(e) {
    console.log('Got message :::', e);
    console.log(e.data);
};
es.onerror = function() {
    console.log('ERROR!');
};
