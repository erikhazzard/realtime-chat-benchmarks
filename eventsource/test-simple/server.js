var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var events = require('events');

var heapdump = require('heapdump');

var totalClients = 0;
var port = process.argv[2] || 8010;
var id = 0;
var msgSend = 0;
var eventEmitter = new events.EventEmitter();
var multer  = require('multer')

eventEmitter.setMaxListeners(20000);
http.globalAgent.maxSockets = 30000;



function format (val){
    return Math.round(((val / 1024 / 1024) * 1000) / 1000) + 'mb';
}

var statsId = setInterval(function () {
    console.log('Memory Usage :: ' +
        ("\tRSS: " + format(process.memoryUsage().rss)) +
        ("\tHeap Total: " + format(process.memoryUsage().heapTotal)) +
        ("\tHeap Used: " + format(process.memoryUsage().heapUsed)) +
        ("\t\tNr Clients: " + (""+totalClients)) +
        (("\t\Msg Sent: " + ""+msgSend))
    );


}, 1500);


console.log('Server starting...');

// Setup routes
var app = express();

// App config
app.set('showStackError', true);
app.locals.pretty = true;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ dest: '/tmp'}));


app.use(function(req, res, next){
    // Enable CORs support
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    // use utf8 encoding
    res.charset = 'utf-8';
    next();
});


app.engine('html', require('ejs').renderFile);
app.set('views', __dirname); 

app.post('/free-clients', function msg(req, res, next){

    

    var allRooms = Object.keys(rooms);

    console.log("Free Clients.......");

    allRooms.forEach(function(roomName, i){
        console.log("Before: Number of listerners", eventEmitter.listeners(roomName).length);
        eventEmitter.removeAllListeners(roomName);    
        console.log("After: Number of listerners", eventEmitter.listeners(roomName).length);
    });


    console.log("Memory",  process.memoryUsage() );
    rooms = [];
    allRooms = [];
    heapdump.writeSnapshot(__dirname + '/logs/heapsnapshot/' + Date.now() + '.heapsnapshot');
    res.send("CLIENTS_CLEARED_DONE");





});

app.post('/msg', function msg(req, res, next){
    
    var roomId = req.body["msg"];
    eventEmitter.emit(roomId);
    res.send(roomId);

});


var rooms = {};

app.get('/eventsource', function routeEventsource(req, res, next){
    
    var room = req.headers["room"];
    var clientId = req.headers["clientid"];


    res.room = room;
    res.clientId = clientId;
    
    rooms[room+''] = 0;

    totalClients++;
    //req.socket.setTimeout(Infinity);

    res.react = (function(){
        
        var receivedTime = new Date().getTime();
        msgSend++;
        this.write("retry: 10000\n");
        this.write("event: "+(this.room)+"\n");
        this.write('data: '+(receivedTime)+'\n\n');

    }).bind(res);

    eventEmitter.on(room+"", res.react);
        
    res.setTimeout( 1000 * 60 * 60 * 24);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    res.write("retry: 10000\n");
    res.write("event: connected\n");
    res.write('data: '+(clientId)+'\n\n');

    
    id++;

    // If the client disconnects, let's not leak any resources
    res.on('close',  function() {
        //console.log('[x] Res disconnected!', this.statusCode, this.room, "Client: ",this.clientId);
        //console.log('[x] Res disconnected!', this.statusCode, this.room, "Client: ",this.clientId);
        totalClients--;
        //console.log(this.room ,"Before: Nr of listeners:: ", eventEmitter.listeners(this.room).length)
        eventEmitter.removeListener(this.room, this.react);
        //console.log(this.room , "After Nr of listeners:: ", eventEmitter.listeners(this.room).length)
        
        
    });
 

});

// Then, handle missing pages
// ----------------------------------
app.use(function handleError(err, req, res, next){
    console.error('(in handleError) Error with request: ' + req.url + ' | ' + err, {
        error: err
    });
    // Don't set status for cloudfront
    return res.send(500, err+'');
});

// Finally, handle any errors
// -----------------------------------
app.use(function handleMissingPage(req, res, next){
    console.error('Invalid page requested: ' + req.url);
    res.send(404, 'Invalid page');
});
console.log("Running on port: ", port);

heapdump.writeSnapshot(__dirname +'/logs/heapsnapshot/' + Date.now() + '.heapsnapshot');

var server = app.listen(port);
