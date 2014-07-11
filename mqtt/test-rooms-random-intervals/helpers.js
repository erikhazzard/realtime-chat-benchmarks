/**
 *
 *  Computes the average time in logs/amqp-rooms-messages.log
 *
 */

var fs = require('fs'),
    readline = require('readline');

module.exports.calcAvg = function(logfile, column,callback){

    var values = [];
    
    readline.createInterface({
        input: fs.createReadStream(logfile),
        terminal: false
    }).on('line', function(line) {
        // For each line add it to an array
        var strings = line.toString().split(/\s+/).filter(Boolean);
        
        var num = parseFloat(strings[column].replace(',', '.'));

        if (Number(num)) {
            // Add to array
            values.push(Number(num));
        } else {
            return;
        }
    }).on('close', function() {
        // take average
        var sum = 0;
        for (var i = 0; i < values.length; i++) {
            sum += values[i];
        }

        callback(sum / values.length);
    });


};