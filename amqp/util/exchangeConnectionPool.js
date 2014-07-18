/* =========================================================================
 *
 * exchangeConnectionPool.js
 *  Exports an exchange connection pool
 *
 *  ======================================================================== */
var _ = require('lodash');
var nconf = require('nconf');
var winston = require('winston');
var amqpConnection = require('./amqp-connection');

// Setup rabbitmq exchange connection pool
// --------------------------------------
// NOTE: this array will initiall be empty, but will be populated when the
//  AMQP exchange connections are established
var RABBITMQ_EXCHANGES = []; // connection pool
var numConnections = nconf.get('amqp:exchangeConnectionPoolSize') || 10;

amqpConnection.on('ready', function setupExchange (){
    winston.debug('Setting up exchange...');

    // Listen on the `chatRoom` exchange (name specified in config), set up a
    // `topic` exchange
    _.each(_.range(numConnections), function setupExchange (i){
        amqpConnection.exchange(
            nconf.get('amqp:chatRoomTopic'),
            { type: 'topic', autoDelete: false },
            function exchangeOpenCallback (exchange){
                winston.silly('Connected to exchange! (' + i + ')');

                // store reference so we can publish on disconnect
                RABBITMQ_EXCHANGES.push(exchange);
            }
        );
    });
});

module.exports = RABBITMQ_EXCHANGES;