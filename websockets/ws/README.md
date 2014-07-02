# WS
Notes...

## Limits

### Out of box, no additional config
With server-single.js and cilent-connections-single.js, out of the box it supports around 2,000 clients before throwing an error: 


    events.js:72
            throw er; // Unhandled 'error' event
                  ^

    Error: getaddrinfo ENOTFOUND
        at errnoException (dns.js:37:11)
        at Object.onanswer [as oncomplete] (dns.js:124:16)
