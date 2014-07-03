var mqtt = require('mqtt');

var NUM_CLIENTS = 10000,
    clients = [];

for (var i = 0; i < NUM_CLIENTS; i++) {
    clients[i] = mqtt.createClient(1883, 'localhost');

    clients[i].subscribe('presence');
}

client.publish('presence', "Hello mqtt");

client.on('message', function(topic, message) {
    console.log(message);
});

client.end();