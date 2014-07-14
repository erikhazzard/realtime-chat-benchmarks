var EventSource = require('eventsource');
var es = new EventSource('http://localhost:1223/sse');
var async = require("async");
var _ = require("lodash");

console.log("Range", _.range(20))

var index = 0;

ITERATIONS = 3;

var id;

id = setInterval(function(d, i){
  
  if(index <= ITERATIONS){
    console.log("Run");
  }else{
    console.log("Finished");
    clearInterval(id);
  }


  index++;
}, 500);






// async.each(_.range(20), function(index, callback){
//   console.log("Hello", "index", index)

//   var es = new EventSource('http://localhost:1223/sse', {
//     index: index
//   });

//   // es.onmessage = function(e) {
//   //   console.log(e.data);
//   // };

//   es.onerror = function(i){
//     return function(e) {
//       console.log("ES:: Error:: ", e.data);
//     };
//   }(index);

//   es.onopen = function(i){
//     return function(e) {
//       console.log("ES:: Openend Connection:: "+(i)+" ", e);
//     };
//   }(index);


//   callback();
  

// }, function(results){
  
//   console.log("Created all clients");


// });




