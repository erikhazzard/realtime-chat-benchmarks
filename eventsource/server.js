var SSE = require('sse');
  , http = require('http');

var server = http.createServer(function(req, res) {
  console.log("Client connected", req.headers)
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('okay');
});

server.listen(1223, '127.0.0.1', function() {
  var sse = new SSE(server);

  sse.on('connection', function(client) {
    console.log("Client connected");
    client.send('hi there!');
  });


  sse.on('error', function(client) {
    console.log("Error");
    
  });

});