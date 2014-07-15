/* =========================================================================
 * 
 * client-simple.js
 *  Simple eventsource client
 *
 *  ======================================================================== */
var EventSource = require('eventsource');
var async = require("async");
var _ = require("lodash");
var http = require('http');
http.globalAgent.maxSockets = Infinity;

async.eachLimit(_.range(1), 2, function(index, callback){
  console.log("Create client", "index", index);

  var es = new EventSource('http://localhost:8010/eventsource');
  //var es = new EventSource('http://127.0.0.1:8010/sse');

  // Message callbacks
  es.onmessage = function(i){
    return function(e, message) {
        console.log('Got message :::', i, e.data);
        //console.log(e.data);
    };
  }(index);
  
  es.onerror = function() {
      console.log('ERROR!');
  };

  debugger;
  es.addEventListener("room-1", function(e){
    console.log('Got message :::', i, e.data);
  });


  callback();

  

}, function(results){
  
  console.log("Created all clients");


});




