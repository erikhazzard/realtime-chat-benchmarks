/* =========================================================================
 * 
 * server-simple.js
 *  Simple express - eventsource server
 *
 *  ======================================================================== */
var express = require('express');
var winston = require('winston');
var expressWinston = require('express-winston');
var compression = require('compression');
var colors = require('colors');
var http = require('http');
var _ = require('lodash');
var async = require("async");
var bodyParser = require('body-parser');
var util = require("util");
var events = require('events');



var totalClients = 0;

var port = process.argv[2] || 8010;

var id = 0;



http.globalAgent.maxSockets = 30000;

var msgSend = 0;


function format (val){
    return Math.round(((val / 1024 / 1024) * 1000) / 1000) + 'mb';
}

var statsId = setInterval(function () {
    console.log('Memory Usage :: '.bold.green.inverse +
        ("\tRSS: " + format(process.memoryUsage().rss)).blue +
        ("\tHeap Total: " + format(process.memoryUsage().heapTotal)).yellow +
        ("\tHeap Used: " + format(process.memoryUsage().heapUsed)).magenta +
        ("\t\tNr Clients: " + (""+totalClients).white) +
        (("\t\Msg Sent: " + ""+msgSend).cyan)
    );


}, 1500);

var eventEmitter = new events.EventEmitter();
eventEmitter.setMaxListeners(20000);
console.log('Server starting...');

// Setup routes
var app = express();

// App config
app.set('showStackError', true);
app.locals.pretty = true;

app.use(bodyParser());

//// CORs support
app.use(compression());
app.use(function(req, res, next){
    // Enable CORs support
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    // use utf8 encoding
    res.charset = 'utf-8';
    next();
});


// Log requests
// var routeLogTransports = 
// app.use(expressWinston.logger({
//     transports: [
//         new winston.transports.Console({
//             json: false, colorize: true
//         })
//     ],
//     meta: true,
//     level: 'verbose'
// }));
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname); 

// --------------------------------------
//
// App routes
//
// --------------------------------------
app.get('/', function routeHome(req, res){
    return res.render('html-client.html');
});



app.get('/test', function msg(req, res, next){

    console.log("Test call")
    res.send("---")
});



app.post('/free-clients', function msg(req, res, next){

    var allRooms = _.keys(rooms);

    console.log("Free Clients.......");

    
    _.each(allRooms, function(roomName, i){
        console.log("Number of listerners", eventEmitter.listeners(roomName).length);
        eventEmitter.removeAllListeners(roomName);    
        console.log("Number of listerners", eventEmitter.listeners(roomName).length);
    });

    global.gc();

    console.log("Memory",  process.memoryUsage() );

    res.send("CLIENTS_CLEARED_DONE");





});

app.post('/msg', function msg(req, res, next){
    
    var roomId = req.body["msg"];
    
    eventEmitter.emit(roomId);

    res.send(roomId);

});


var rooms = {};

app.get('/eventsource', function routeEventsource(req, res, next){
    //console.log('>> EventSource connected' );


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
        totalClients--;
        eventEmitter.removeListener(this.room, function(d, i){
            console.log("Removed EventListener")
        });

        
    });

    

});

// Then, handle missing pages
// ----------------------------------
app.use(function handleError(err, req, res, next){
    winston.error('(in handleError) Error with request: ' + req.url + ' | ' + err, {
        error: err
    });
    // Don't set status for cloudfront
    return res.send(500, err+'');
});

// Finally, handle any errors
// -----------------------------------
app.use(function handleMissingPage(req, res, next){
    winston.error('Invalid page requested: ' + req.url);
    res.send(404, 'Invalid page');
});
console.log("Running on port: ", port);
var server = app.listen(port);
