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

async.eachLimit(_.range(20), 2, function(index, callback){
  console.log("Create client", "index", index);

  var es = new EventSource('http://localhost:8010/eventsource');
  //var es = new EventSource('http://127.0.0.1:8010/sse');

  // Message callbacks
  es.onmessage = function(d, i){
    return function(e) {
        console.log('Got message :::', index, e);
        //console.log(e.data);
    };
  }(index);
  
  es.onerror = function() {
      console.log('ERROR!');
  };

  setTimeout(function(){
    callback();
  }, 1000);
  

}, function(results){
  
  console.log("Created all clients");


});




