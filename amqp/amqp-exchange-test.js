/**
 *
 *  amqp-exchange-test
 *
 *  Tests AMQP exchange stuff, like connecting to the same exchange
 *
 */

var amqp = require('amqp');
var _ = require('lodash');

var connection = amqp.createConnection({
    host: 'localhost'
});

connection.on('ready', function() {
    // console.log('ready');
    var ex = connection.exchange('test-ex', {
        type: 'fanout'
    }, function() {
        var queue = connection.queue('test-q', function(q) {
            // q.bind(ex);
            q.bind(ex, 'key');
            console.log("bound");

            q.subscribe(function(msg) {
                console.log("Message received in q1: " + msg.msg);
            });

            ex.publish('test-q', {
                msg: 'hi'
            }, {
                contentType: 'application/json'
            });
        });

        // now same exchange?
        var test = connection.exchange('test-ex', {
            type: 'fanout'
        });

        test.publish('test-q', {
            msg: 'hey'
        }, {
            contentType: 'application/json'
        });

        var q2 = connection.queue('test-q2', function(q) {
            q.bind(test, 'key');

            q.subscribe(function(msg) {
                console.log("Message received in q2: " + msg.msg);
            });

            ex.publish('test-q', {
                msg: 'hey from q2'
            }, {
                contentType: 'application/json'
            });

            test.publish('test-q', {
                msg: 'heyy'
            }, {
                contentType: 'application/json'
            });
        });
    });
});