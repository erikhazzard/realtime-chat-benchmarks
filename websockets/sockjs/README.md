# SockJS
Notes...

SockJS seems to always hang up when attempting to connect a lot of clients to a server (I usually test with 20k). This usually happens around the 8k-12k mark ans I think it's an issue with SockJS as opposed to some network/sys settings because other libraries like `ws` have no issues connecting more clients. All of the clients *usually* do connect after the initial hang up but it takes a while.

Time to broadcast just one message to 20k clients looks like it's ~3.5s.

