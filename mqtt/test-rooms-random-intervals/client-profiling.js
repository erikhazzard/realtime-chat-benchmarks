/* =========================================================================
 *
 * Clients:
 *  Starts multiple clients asynchronously and connects all of them to a
 *  channel
 *
 * After creating all clients. The script will send one message to each room
 * which will be received from every member of the room
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
    helpers = require('./helpers.js'),
    NUM_CLIENTS = process.argv[2] || 0,
    NUM_ITERATIONS = process.argv[3] || Infinity,
    totalClients = 0,
    mqttUri = process.argv[4] || 'localhost';

var DELAY_BETWEEN_CONCURRENT_SENDERS = 20;
var sys = require('sys');
var exec = require('child_process').exec;


var msgNr = 0;
var roomId = 0;

var TIME_TO_WAIT_MSG_SENDING = 2000;

var MAX_NR_PEOPLE_IN_ROOM = 6;

var logFilePath = './logs/logs.log';
var logFilePathMgAvg = './logs/messageAvg.log';
var logFilePathCpuAvg = './logs/cpuAvg.log';

var start = new Date();
var broadcastClients = [];

var index = 0;

// Reset Logging Files
fs.writeFile(logFilePath, "", function (err) { if (err) return console.log(err);});
fs.writeFile(logFilePathMgAvg, "", function (err) { if (err) return console.log(err);});
fs.writeFile(logFilePathCpuAvg, "", function (err) { if (err) return console.log(err);});

winston.info("Number of clients to create: ", NUM_CLIENTS);
winston.info("Number of iterations: ", NUM_ITERATIONS);


async.each(_.range(NUM_CLIENTS), function(i, callback) {

    var client = mqtt.createClient(8883, mqttUri);


    if(index === MAX_NR_PEOPLE_IN_ROOM){
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

        var time = new Date().getTime();
        var timeSpent = time - parseInt(message, 10);
        var message = "Msg \t"+topic+"\t"+timeSpent+"\t"+this.clientId+"\n";
        fs.appendFile(logFilePath, message, function (err) { if (err) return console.log(err); });
        msgNr++;

    });

    index++;

}, function(err, res) {
    //process.exit(1);
    var end = new Date() - start;
    winston.info("Time to create clients : %ds", end / 1000);


    var startIntervals = new Date();

    setTimeout(function(){
        NUM_CONCURRENT_SENDERS = broadcastClients.length;
        var client_iterations = [];
        var intervalIds = [];

        for (var i = 0; i < NUM_CONCURRENT_SENDERS; i++) {
            client_iterations.push(0);
            setTimeout(function (index){
                return function (){

                    //Save the id of the interval
                    var timerId = setInterval(function (index_inner){

                            return function () {


                                if(NUM_ITERATIONS < Infinity && client_iterations[index_inner] < NUM_ITERATIONS){

                                    var client = broadcastClients[index_inner];
                                    client.publish(client.roomId, new Date().getTime()+"");
                                    client_iterations[index_inner] +=1;

                                } else {

                                  clearInterval(intervalIds[index_inner]);

                                  if(index_inner === intervalIds.length-1){

                                    setTimeout(function(d, i){

                                        console.log("Finished. Time to run all iterations", (new Date() - startIntervals)/1000, "s");
                                        var column = 2;
                                        helpers.calcAvg( logFilePath, column, function(val){
                                            console.log("Average MsgTime time (ms): " + val);

                                            helpers.calcAvg(logFilePathCpuAvg, 0, function(val){
                                                console.log("Average CPU time: " + val.toFixed(2),'%');
                                                console.log("Message Send Total: ", msgNr);
                                                process.exit(0);
                                            });


                                       });




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
