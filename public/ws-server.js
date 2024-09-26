const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8976 });

wss.on('connection', (stream) => {
    /**
     * If the websocket doesn't receive any message for 5 seconds since last receive, it will broadcast a 
     * terminate signal to all of its clients.
     */
    let timeoutId;
    resetTimer();

    stream.on('message', (message) => {
        console.log(`WebSocket: Received ${message.slice(0, 25)}..., Size:${message.length}`)
        try {
            broadCastMessage(message);
        } catch (e) {
            console.log("Error sending message: ", e);
        }
        resetTimer();
    });

    stream.send(JSON.stringify({ message: `WebSocket server connected. Time:${Date.now()}` }));

    /**
     * Reset the timeout timer whenever a streaming message is received.
     */
    function resetTimer() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            console.log("WebSocket: Timeout!");
            broadCastMessage({ terminate: true });
        }, 5000);
    }

    /**
     * Broad cast a message to every client of the websocket server.
     * @param {*} message The message to be broadcasted.
     */
    function broadCastMessage(message) {
        wss.clients.forEach((client) => {
            if (client !== stream && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
});


