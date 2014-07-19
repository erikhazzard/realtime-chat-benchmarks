/* =========================================================================
 *
 * clients.js
 *  Simple eventsource client
 *
 *  ======================================================================== */
var EventSource = require('eventsource');
var async = require("async");
var _ = require("lodash");
var http = require('http');
var request = require('request');
var fs = require("fs");

var INTERVAL_DELAY = 1000;
var TIMEOUT_DELAY = 1000;
var MAX_PEOPLE_ROOM = 6;
var received_msg = 0;

http.globalAgent.maxSockets = Infinity;

//Command line arguments
var NROFCLIENTS = process.argv[2] || 1;
var ITERATIONS = process.argv[3] || 1;
var PORT = process.argv[4] || 8010;
var HOST = "localhost:" + PORT;
ALL_CLIENTS = [];

console.log("Number of Clients: ", NROFCLIENTS);
console.log("Number of Iterations: ", ITERATIONS);
console.log("Connect to port: ", PORT);

var startTime = new Date().getTime();


var iterationsDone = 0;
var clients = [];
var i = 0;

var connectedClients = 0;

var connectedStart = new Date().getTime();
var clientInitTime;

var randomNumber = Math.floor(Math.random() * 1000);

async.eachLimit(_.range(NROFCLIENTS), 200, function(index, callback) {

    
    var roomId = Math.floor(index / MAX_PEOPLE_ROOM)+"-"+randomNumber;

    //console.log("RoomId", roomId);
    
    var headers = {
        headers: {
            'room': "r-" + roomId,
            'clientid': index
        }
    };
    var es = new EventSource('http://' + (HOST) + '/eventsource', headers);


    es.onerror = function(e) {
        //console.log('ERROR!', JSON.stringify(e.data), es.readystate);
    };


    es.addEventListener("connected", (function(rIfd, clientId) {
        connectedClients++;

        ALL_CLIENTS.push(this);

        if (connectedClients == NROFCLIENTS) {


            var end = new Date().getTime();
            clientInitTime = (end - connectedStart) / 1000;
            startSendingMessages();

        }


    }).bind(es));


    es.addEventListener("r-" + roomId, function(rIfd, clientId) {
        return function(e, i) {
            received_msg++;

            if (received_msg % NROFCLIENTS === 0) {

                iterationsDone++;
            }

            //console.log("Received msg in room: ", rIfd, "for client", clientId);


        };
    }(roomId, index));

    if (i === MAX_PEOPLE_ROOM) {

        i = 0;

    }

    if (i === 0) {

        es.roomId = "r-" + roomId;
        clients.push(es);
    }


    i++;
    callback();



}, function(results) {

    console.log("Created all clients");
});


function startSendingMessages() {

    setTimeout(function(d, i) {

        var intervalId = setInterval(function() {

            if (iterationsDone < ITERATIONS) {

                _.each(clients, function(client, i) {

                    var url = "http://"+(HOST)+"/msg";
                    request.post(url, {
                        form: {
                            msg: client.roomId,
                            time: new Date().getTime()
                        }
                    }, function(err, res) {
                        if (err) {
                            return console.log("An error occured", JSON.stringify(err));
                        }

                    });

                });


            } else {
                console.log("Finished all iterations");
                clearInterval(intervalId);

                var finishedTime = new Date().getTime();
                var total = finishedTime - startTime;
                console.log("Time to connected all clients: ", clientInitTime);

                console.log("Message Received: ", received_msg);
                console.log("Total time: ", total / 1000, " seconds");

                _.each(ALL_CLIENTS, function(client, i) {
                    client.close();
                });

                setTimeout(function(){
                  var url = "http://"+(HOST)+"/free-clients";

                  request.post(url, function(){
                    console.log("x");
                    process.exit(0);

                 });


                }, TIMEOUT_DELAY);

            }

        }, INTERVAL_DELAY);


    }, TIMEOUT_DELAY);




}
