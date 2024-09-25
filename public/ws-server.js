const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (stream) => {
    let timeoutId;
    resetTimer();

    stream.on('message', (message) => {
        console.log('received: %s', message.slice(0, 100));
        try {
            // wss.clients.forEach((client) => {
            //     if (client !== stream && client.readyState === WebSocket.OPEN) {
            //         client.send(JSON.stringify(message));
            //     }
            // });
            broadCastMessage(message);
            resetTimer();
        } catch (e) {
            console.log("Error sending message: ", e);
        }
    });

    function resetTimer() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            // stream.send(JSON.stringify({ terminate: true }));
            console.log("Timeout!")
            broadCastMessage({ terminate: true });
        }, 5000);
    }

    function broadCastMessage(message) {
        wss.clients.forEach((client) => {
            if (client !== stream && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    stream.send(JSON.stringify({ message: `WebSocket server connected. Time:${Date.now()}` }));
});


