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


var nrOfClients = process.argv[2] || 1;
var port = process.argv[3] || 8010;

console.log("Number of Clients: ", nrOfClients);
console.log("Connect to port: ", port);

async.eachLimit(_.range(nrOfClients), 20, function(index, callback){
  console.log("Create client", "index", index);

  var es = new EventSource('http://localhost:'+(port)+'/eventsource');
  //var es = new EventSource('http://127.0.0.1:8010/sse');

  // Message callbacks
  es.onmessage = function(i){
    return function(e) {
        //console.log('Got message :::', i, e.data);
        //console.log(e.data);
    };
  }(index);
  
  es.onerror = function(e) {
      console.log('ERROR!', JSON.stringify(e));
  };

  
  es.addEventListener("room-1", function(e){
    //console.log('Got message :::', e.data);
  });


  process.nextTick(function(d, i){
    callback();
  });

  

}, function(results){
  
  console.log("Created all clients");


});




