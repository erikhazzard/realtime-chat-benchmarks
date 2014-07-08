## ws

#### Notes

Time for a message to be broadcast to all other clients connected to a particular exchange (room) is 5-10ms.

Time for a message to be broadcast to 20,000 clients is ~2.5s.


These time can probably be improved by removing some of the extra statements in the code and other optimizations (protobuf, etc.).