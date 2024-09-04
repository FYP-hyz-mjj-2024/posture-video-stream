const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (stream) => {
    stream.on('message', (message) => {
        console.log('received: %s', message.slice(0, 100));
        try {
            wss.clients.forEach((client) => {
                if (client !== stream && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        } catch (e) {
            console.log("Error sending message: ", e);
        }
    })

    stream.send(JSON.stringify({ message: `WebSocket server connected. Time:${Date.now()}` }));
});