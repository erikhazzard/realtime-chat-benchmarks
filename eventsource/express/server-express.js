/* =========================================================================
 * 
 * server-simple.js
 *  Simple express - eventsource server
 *
 *  ======================================================================== */
var express = require('express');
var winston = require('winston');
var expressWinston = require('express-winston');

console.log('Server starting...');

// Setup routes
var app = express();

// App config
app.set('showStackError', true);
app.locals.pretty = true;

//// CORs support
//app.use(function(req, res, next){
    //// Enable CORs support
    //res.header('Access-Control-Allow-Origin', '*');
    //res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    //res.header('Access-Control-Allow-Headers', 'Content-Type');
    //// use utf8 encoding
    //res.charset = 'utf-8';
    //next();
//});

// Log requests
var routeLogTransports = 
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            json: false, colorize: true
        })
    ],
    meta: true,
    level: 'verbose'
}));
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

app.get('/eventsource', function routeEventsource(req, res, next){
    console.log('>> EventSource connected');

    req.socket.setTimeout(Infinity);
    //req.socket.setNoDelay(true);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write(':ok\n\n');

    var sendMessages = setInterval(function(){
        color = '#336699';
        res.write('id: 1 \n');
        res.write('data: {"bg":"#' + color + '"}\n\n');
    }, 10);

    // If the client disconnects, let's not leak any resources
    res.on('close', function() {
        console.log('[x] Res disconnected!');
        clearInterval(sendMessages);
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

var server = app.listen(8010);
