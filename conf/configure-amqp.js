//============================================================================
//
//configure-amqp.js
//  Configures amqp related settings
//
//============================================================================
var nconf = require('nconf');
var winston = require('winston');

module.exports = function configureRedis(){
    nconf.add('amqp', {
        'type': 'literal',
        //amqp
        'amqp': {
            'host': 'localhost',
            'channel': 'userRated',
            'channel-analytics': 'analytics',
            'unsubscribeHmac': 'thisissomerandompasswordfinestshootbreakfastdeeply',
            // NOTE: must match python queue name
            'queueName': 'prediction-rpc-queue'
        }
    });
};
