
var mqtt = require('mqtt')

var client;

for (var i = 0; i < 10000; i++) {
  



  client = mqtt.createClient(61613, 'localhost', {username: "admin", password: "password"});

  client.subscribe('presence');
  //client.publish('presence', 'Hello mqtt');

  client.on('message', function (topic, message) {
    console.log(message);
  });


};

console.log("Finished creating clients");

//client.end();