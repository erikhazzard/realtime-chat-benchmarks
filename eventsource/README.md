# Event Source


## Clarification
* SSE = Server-Sent Events
* Authentification
* CORS support
* Cookies


## Findings


* The field name must be either “data”, “event”, “id”, or “retry”.
* A message from the server can contain ```event:``` and a client can listen for that event type
* Client can only receive UTF-8 data (No binary data)
* You need to set the ```http.globalAgent.maxSockets``` in your node.js server (this works for Express.js too)


```bash 
  # 1. Start Express.Js Server, which handles incoming EventSource connections
  # The server will every 1.5s show some machine status and the # of connected clients
  $ node server-express.js


  # 2. Connect x number of event source clients (ex: 100)
  # Takes in the number of clients to create as a first command line argument
  $ node multiple-clients.js
  
  # The script calls x times the client-simple.js script in the express folder
  
```

## Links
* [Load Testing Server Sent Event Streams](http://matthiasnehlsen.com/blog/2013/05/11/load-testing-server-sent-event-streams/)
* [Basic Introduction](http://www.html5rocks.com/en/tutorials/eventsource/basics/)
* [Pros and Cons](http://www.activestate.com/blog/2013/07/server-sent-events-aura-and-nodejs)
* [What is SSE and what not](http://tomkersten.com/articles/server-sent-events-with-node/)
* [Good Overview](http://chimera.labs.oreilly.com/books/1230000000545/ch16.html#EVENT_STREAM_PROTOCOL)
* [Example Archicture for SSE](http://www.slideshare.net/beatfactor/sse-23276287)
* [What are Long-Polling, Websockets, Server-Sent Events (SSE) and Comet?](http://stackoverflow.com/questions/11077857/what-are-long-polling-websockets-server-sent-events-sse-and-comet)

## Terms
* session affinity
* sticky session

Last-Event-ID: 43