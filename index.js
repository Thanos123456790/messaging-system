const WebSocket = require('ws');

const PORT = process.env.PORT || 5001;
const wss = new WebSocket.Server({ port: PORT });
const rooms = {}; // { roomId: [clients] }

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const { type, roomId, text } = JSON.parse(message);

        if (type === 'join') {
            if (!rooms[roomId]) {
                rooms[roomId] = [];
            }
            rooms[roomId].push(ws);
            ws.roomId = roomId;
            console.log(`User joined room: ${roomId}`);
        } else if (type === 'message') {
            const clients = rooms[ws.roomId];
            if (clients) {
                clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'message', text }));
                    }
                });
            }
        }
    });

    ws.on('close', () => {
        const roomId = ws.roomId;
        if (roomId) {
            rooms[roomId] = rooms[roomId]?.filter((client) => client !== ws);
        }
    });
});

console.log(`WebSocket server is running on port ${PORT}`);
