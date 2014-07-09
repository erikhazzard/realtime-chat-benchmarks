import sys
import time
import zmq
import atexit

context = zmq.Context()
backend = context.socket(zmq.PUB)

port = 'tcp://127.0.0.1:12345'
backend.bind(port);

def exit_handler():
    print 'Done! Number sent: ', numSent

atexit.register(exit_handler)

numSent = 0

while True:
    backend.send('roomid: test')
    numSent += 1
