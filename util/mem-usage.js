/**
 *
 *  Intermittently
 *
*/

var colors = require('colors');
function format(val) {
    return Math.round(((val / 1024 / 1024) * 1000) / 1000) + 'mb';
}

var logMemUsage = function(delay) {
    setInterval(function() {
        console.log('Memory Usage :: '.bold.green.inverse +
            ("\tRSS: " + format(process.memoryUsage().rss)).blue +
            ("\tHeap Total: " + format(process.memoryUsage().heapTotal)).yellow +
            ("\t\tHeap Used: " + format(process.memoryUsage().heapUsed)).magenta
        );
    }, delay);
};

module.exports = logMemUsage;