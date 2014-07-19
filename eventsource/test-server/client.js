var EventSource = require('eventsource');
var es = new EventSource('http://localhost:1223/sse');


es.onmessage = function(e) {
  console.log(e.data);
};

es.onerror = function(e) {
  console.log("ES:: Error:: ", e.data);
};

es.onopen = function(e) {
  console.log("ES:: Openend Connection:: ",e);
};

