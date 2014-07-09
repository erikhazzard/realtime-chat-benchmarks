/* =========================================================================
 *
 * clients
 *  Starts multiple clients asynchronously and connects all of them to a
 *  channel
 *
 *
 * ========================================================================= */

var mqtt = require('mqtt'),
    cluster = require('cluster'),
    async = require('async'),
    colors = require('colors'),
    winston = require('winston'),
    _ = require('lodash'),
    numCPUs = require('os').cpus().length,
    fs = require('fs'),
    NUM_CLIENTS = process.argv[2] || 0,
    totalClients = 0;


var sys = require('sys')
var exec = require('child_process').exec;


var msgNr = 0;
var roomId = 0;

var TIME_TO_WAIT_MSG_SENDING = 2000;

var MAX_NR_PEOPLE_IN_ROOM = 6;

var logFilePath = './logs/logs.log';

var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.File) ({
            filename: logFilePath,
            level: 'verbose'
        })
    ]
});

var start = new Date();
var broadcastClients = [];

var index = 0;

// Reset Logging File
fs.writeFile(logFilePath, "", function (err) {
  if (err) return console.log(err);
  
});


async.each(_.range(NUM_CLIENTS), function(i, callback) {

    var client = mqtt.createClient(8883, 'localhost');

    client.on('error', function(e) {
        winston.error("Error", JSON.stringify(e));
    });

    

    client.on('connect', function(){
        //winston.info("Connected", this.roomId);
        process.nextTick(function(){
            callback();
        });

    });

    if(Math.floor(index / MAX_NR_PEOPLE_IN_ROOM) === 1){
        roomId++;
        //winston.info("New room, name: ", roomId);
        broadcastClients.push(client);
        
        index = 0;
    
    }

    client.roomId = roomId;
    client.clientId = i;

    client.subscribe(roomId+'');


    client.on("message", function(topic, message) {

        var time = new Date().getTime();
        var message = "Msg \t"+topic+"\t"+time+"\t"+this.clientId+"\n"


        fs.appendFile(logFilePath, message, function (err) {
          if (err) return console.log(err);
          
        });

        msgNr++;
    });

    index++;

}, function(err, res) {
    //process.exit(1);
    var end = new Date() - start;
    winston.info("Time to create clients : %ds", end/1000);

    setTimeout(function(d, i){
        
        _.each(broadcastClients, function(client, i){
            
            var time = new Date().getTime();

            var message = "Msg \t"+client.roomId+"\t"+time+"\t"+client.clientId+"\n"

            fs.appendFile(logFilePath, message, function (err) {
              if (err) return console.log(err);
            });

            client.publish(client.roomId+'', "Hello World");

        });

        setTimeout(function(d, i){
            winston.info("Assemble results");
        
            function puts(error, stdout, stderr) { 
                
                sys.puts(stdout) 
                process.exit(0);
            }
            exec("sh ./date_diff.sh", puts);
            

        }, TIME_TO_WAIT_MSG_SENDING);




    }, TIME_TO_WAIT_MSG_SENDING);



    
});
