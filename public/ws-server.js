const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (stream) => {
    stream.on('message', (message) => {
        console.log('received: %s', message.slice(0, 100));
        stream.send(JSON.stringify({ message: message }));
    })

    stream.send(JSON.stringify({ message: `WebSocket server connected. Time:${Date.now()}` }));
});