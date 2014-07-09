var mqtt = require('mqtt')

client = mqtt.createClient(1883, 'localhost');
client.publish('presence', 'Hello');
