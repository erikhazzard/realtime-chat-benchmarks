var EventSource = require('eventsource');
var es = new EventSource('http://localhost:8080/sse');


es.onmessage = function(e) {
  console.log(e.data);
};