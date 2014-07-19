//============================================================================
//
//amqp-connection.js
//  returns an amqp connection object
//
//============================================================================
var nconf = require('nconf');
var amqp = require('amqp');
var winston = require('winston');

//---------------------------------------
//Setup redis client
//---------------------------------------
//Configure it. Note: This only sets defaults if nothing has been set in
//  config files
nconf.add('amqp', {
       'type': 'literal',
       //amqp
       'amqp': {
           'host': 'localhost',
           'chatRoomTopic': 'chatRoom',
           'unsubscribeHmac': 'thisissomerandompasswordfinestshootbreakfastdeeply'
       }
   });

//Create client
winston.debug('Starting up AMQP connection, waiting to connect...');
var connection = amqp.createConnection({
    host: nconf.get('amqp:host')
});

connection.on('error', function(err) {
    winston.error(err + '');
    if((err+'').match('socket is closed')){
        winston.warn('Could not connect to AMQP (rabbitmq-server is not running)');
    }
    winston.warn('NO AMQP server running.');
});

connection.on('ready', function(err) {
    //catch redis errors so server doesn't blow up
    winston.debug('AMQP Server connection established!');
});

//export the client
module.exports = connection;