/**
 *
 *  Computes the average time in logs/amqp-rooms-messages.log
 *
 */

var fs = require('fs'),
    readline = require('readline');

var LOG_FILE_PATH = 'logs/amqp-rooms-messages.log';

var values = [];


readline.createInterface({
    input: fs.createReadStream(LOG_FILE_PATH),
    terminal: false
}).on('line', function(line) {
    // For each line add it to an array
    var strings = line.toString().split(/\s+/).filter(Boolean);

    if (Number(strings[1])) {
        // Add to array
        values.push(Number(strings[1]));
    } else {
        return;
    }
}).on('close', function() {
    // take average
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        sum += values[i];
    }

    console.log("Average time (ms): " + (sum / values.length));
});
