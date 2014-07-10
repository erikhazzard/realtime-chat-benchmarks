/* =========================================================================
 *
 * Clients:
 *  Starts multiple clients asynchronously and connects all of them to a
 *  channel
 *  
 * After creating all clients. The script will send one message to each room
 * which will be received from every member of the room
 *
 * After this is done, we call the date_diff.sh shell script, which compares
 * the first log entry and the last log entry and substract their time stamps
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
    MAX_ITERATIONS = process.argv[3] || Infinity,
    totalClients = 0;

var DELAY_BETWEEN_CONCURRENT_SENDERS = 10;
var sys = require('sys');
var exec = require('child_process').exec;


var msgNr = 0;
var roomId = 0;

var TIME_TO_WAIT_MSG_SENDING = 2000;

var MAX_NR_PEOPLE_IN_ROOM = 6;

var logFilePath = './logs/logs.log';

var start = new Date();
var broadcastClients = [];

var index = 0;

// Reset Logging File
fs.writeFile(logFilePath, "", function (err) {
  if (err) return console.log(err);
  
});

winston.info("Number of clients to create: ", NUM_CLIENTS);


async.each(_.range(NUM_CLIENTS), function(i, callback) {

    var client = mqtt.createClient(8883, 'localhost');


    if(index === 6){
        index = 0;

    }

    client.on('error', function(e) {
        winston.error("Error", JSON.stringify(e));
    });

    client.on('connect', function(){
        //winston.info("Connected", this.roomId);
        process.nextTick(function(){
            callback();
        });

    });

    if(index === 0){
        roomId++;
        //winston.info("New room, name: ", roomId);
        broadcastClients.push(client);
    }


    client.roomId = roomId+'';
    client.clientId = i;

    client.subscribe(roomId+'');


    client.on("message", function(topic, message) {
        //console.log("Message received", topic,message)
        var time = new Date().getTime();
        var message = "Msg \t"+topic+"\t"+time+"\t"+this.clientId+"\n";
        //fs.appendFile(logFilePath, message, function (err) { if (err) return console.log(err); });

    });

    index++;

}, function(err, res) {
    //process.exit(1);
    var end = new Date() - start;
    winston.info("Time to create clients : %ds", end/1000);

    setTimeout(function(){
        NUM_CONCURRENT_SENDERS = broadcastClients.length;
        var client_iterations = [];
        var intervalIds = [];

        for (var i = 0; i < NUM_CONCURRENT_SENDERS; i++) {
            client_iterations.push(0);
            setTimeout(function (index){
                return function (){
                    
                    var timerId = setInterval(function (index_inner){
                        
                            return function () {
                                

                                if(MAX_ITERATIONS < Infinity && client_iterations[index_inner] < MAX_ITERATIONS){
                                    console.log("Message", index_inner)
                                    //console.log("Index", index_inner)
                                    var client = broadcastClients[index_inner];
                                    client.publish(client.roomId, "Hello World");
                                    client_iterations[index_inner] +=1; 

                                }else{
                                  console.log("Cleared Interval")
                                  clearInterval(intervalIds[index_inner]);  
                                  if(index_inner == MAX_ITERATIONS){
                                    
                                    setTimeout(function(d, i){
                                        
                                        console.log("Finished"); 

                                        process.exit(0);

                                    }, 1000);
                                  }

                                }

                            }    
                        

                        

                    }(index), DELAY_BETWEEN_CONCURRENT_SENDERS * NUM_CONCURRENT_SENDERS);

                    intervalIds.push(timerId);

                };
            }(i), DELAY_BETWEEN_CONCURRENT_SENDERS * i);

        }




    }, TIME_TO_WAIT_MSG_SENDING);



    
});
