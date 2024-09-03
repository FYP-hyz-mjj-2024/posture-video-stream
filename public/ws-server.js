const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (stream) => {
    stream.on('message', (message) => {
        console.log('received: %s', message.slice(0, 100));
        // TODO: Why the hell doesn't this work????????
        try {
            stream.send(JSON.stringify({ message: message }));
        } catch (e) {
            console.log("Error sending message: ", e);
        }
    })

    stream.send(JSON.stringify({ message: `WebSocket server connected. Time:${Date.now()}` }));
});

// wss.on('connection', (stream) => {
//     let text = stream.readyState === stream.OPEN ? "Open" : "not open";
//     while (true) {
//         stream.send(JSON.stringify({ message: text }));
//     }
// });