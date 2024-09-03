const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message.slice(0, 100));
        ws.send(JSON.stringify({ message: message }));
    })

    ws.send(JSON.stringify({ message: 'WebSocket server connected.' }));
});