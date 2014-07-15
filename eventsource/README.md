# Event Source


## Findings


```bash 
  # 1. Start Express.Js Server, which handles incoming EventSource connections
  # The server will every 1.5s show some machine status and the # of connected clients
  $ node server-express.js


  # 2. Connect x number of event source clients (ex: 100)
  # Takes in the number of clients to create as a first command line argument
  $ sh create-clients.sh 100
  
  # The script calls x times the client-simple.js script in the express folder
  
```