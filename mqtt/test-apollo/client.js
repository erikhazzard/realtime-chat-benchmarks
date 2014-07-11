var mqtt = require('mqtt')


client = mqtt.createClient(61613, 'localhost', {username: "admin", password: "password"});

client.subscribe('presence');
client.publish('presence', 'Hello mqtt');

client.on('message', function (topic, message) {
  console.log(message);
});



setInterval(function(d, i){
  client.publish('presence', 'Hello mqtt');
}, 1000);