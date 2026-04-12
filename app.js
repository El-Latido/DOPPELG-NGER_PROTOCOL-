const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Almacén de jugadores en memoria volátil
let players = {};

io.on('connection', (socket) => {
    console.log(`> NUEVA CONEXIÓN NEURAL: ${socket.id}`);

    // Crear nuevo jugador
    players[socket.id] = {
        id: socket.id,
        position: { x: 0, y: 1.6, z: 0 },
        rotation: { y: 0 },
        skin: "GENERIC_GEAR" // Aquí es donde el impostor cambiará su apariencia
    };

    // Enviar estado actual a todos
    io.emit('player_list', players);

    // Sincronizar movimiento
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].position = data.position;
            players[socket.id].rotation = data.rotation;
            // Broadcast rápido (volatilidad de datos)
            socket.broadcast.emit('player_moved', players[socket.id]);
        }
    });

    socket.on('disconnect', () => {
        console.log(`> CONEXIÓN PERDIDA: ${socket.id}`);
        delete players[socket.id];
        io.emit('player_disconnected', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`> DOPPELGÄNGER_CORE OPERATIVO EN PUERTO ${PORT}`);
});
