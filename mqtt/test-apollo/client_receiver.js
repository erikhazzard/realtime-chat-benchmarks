
var mqtt = require('mqtt')
var NR_OF_CLIENTS = process.argv[2] || 0;

console.log("Number of clients to create", NR_OF_CLIENTS);

var client;

for (var i = 0; i < NR_OF_CLIENTS; i++) {
  
  console.log("Created client", NR_OF_CLIENTS);
  client = mqtt.createClient(61613, 'localhost', {username: "admin", password: "password"});

  client.subscribe('presence');
  //client.publish('presence', 'Hello mqtt');

  client.on('message', function (topic, message) {
    console.log(message);
  });


};

console.log("Finished creating clients");

//client.end();