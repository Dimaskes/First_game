const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const app = express();

const clientPath = `${__dirname}/../client`;
console.log(clientPath);
app.use(express.static(clientPath));

const server = http.createServer(app);

const io = socketIO(server);

var players = new Set();
var player = {}

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

io.on('connection', (sock) => {
    if (players.size < 2) {
        player = {
            soketID: sock.id,
            busyClass: `square-${getRandomInt(32,63)}`
        };
        players.add(player);
        console.log(sock.id, 'connected');
        sock.emit('message', 'Hi, you are connected');
    } else {
        console.log('connect error! >2 players');
        sock.emit('message', 'connect error! >2 players');
    }

    sock.on('disconnect', () => {
        players.delete(player);
        console.log(player, 'отключился');
    });

    console.log(players);
});



server.on('error', (err) => {
    console.log('Server error: ', err);
});

server.listen(5000, () => {
    console.log('Server started!')
});