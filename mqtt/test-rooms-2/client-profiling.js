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
    NUM_CLIENTS = 1000,
    totalClients = 0;

var msgNr = 0;
var roomId = 0;

var MAX_NR_PEOPLE_IN_ROOM = 6;


var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.File) ({
            filename: '../logs/client-profiling.log',
            level: 'verbose'
        })
    ]
});

var start = new Date();
var broadcastClients = [];

var index = 0;

//Reset Logging File
fs.writeFile('../logs/client-profiling.log', "", function (err) {
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


    console.log("RoomId: ", roomId+'');
    client.subscribe(roomId+'');


    client.on("message", function(topic, message) {

        //winston.info("NR :: ", msgNr , " - MSG::", message, "room: ", topic);  
        
        // process.nextTick(function(){
                
        //     logger.verbose("Message reveiced from room " + topic);

        // });

        var time = new Date().getTime();
        // var message = "Message reveiced from room " + topic + " ";
        //     message += JSON.stringify({
        //             room: this.roomId,
        //             time: time,
        //             clientId: this.clientId
        //         });
        //     message += "\n";


        var message = "Msg \t"+topic+"\t"+time+"\t"+this.clientId+"\n"


        fs.appendFile('../logs/client-profiling.log', message, function (err) {
          if (err) return console.log(err);
          console.log("Message reveiced from room " + topic);
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

            // logger.verbose("Message sent from room " + client.roomId, {
            //     room: client.roomId,
            //     time: time,
            //     clientId: client.clientId
            // });

            var message = "Msg \t"+client.roomId+"\t"+time+"\t"+client.clientId+"\n"

            fs.appendFile('../logs/client-profiling.log', message, function (err) {
              if (err) return console.log(err);
              console.log("Message send from room ");
            });


            console.log("Message to room: ", client.roomId+'')

            client.publish(client.roomId+'', "Hello World");

        });

    }, 2000);



    
});
