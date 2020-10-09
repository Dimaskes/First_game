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

const moveArray = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD']
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function movement(strMove, busyClass) {
    let newPosition = Number(busyClass.slice(7));
    console.log(newPosition);
    switch (strMove) {
        case 'ArrowUp':
            break;
        case 'ArrowDown':
            break;
        case 'ArrowLeft':
            break;
        case 'ArrowRight':
            break;
        case 'KeyW':
            newPosition -= 8;
            break;
        case 'KeyS':
            newPosition += 8;
            break;
        case 'KeyA':
            newPosition -= 1;
            break;
        case 'KeyD':
            newPosition += 1;
            break;
    }
    return newPosition;
}

io.on('connection', (socket) => {

    if (players.size < 2) {
        player = {
            soketID: socket.id,
        };
        players.add(player);
        console.log(socket.id, 'connected');
        socket.emit('message', 'Hi, you are connected');
    } else {
        console.log('connect error! >2 players');
        socket.emit('message', 'connect error! >2 players');
    }

    socket.on('first_player_position', function(data) {
        player.busyClass = data.position;
        io.sockets.emit('first_player_position', data);
        console.log(player);
    });

    socket.on('movement', function(data) {
        let move = data.move;
        let prewPosition = player.busyClass;
        let newPosition = movement(move, prewPosition);
        io.sockets.emit('movement', {
            newPos: newPosition,
            prewPos: prewPosition
        });
        player.busyClass = `square-${newPosition}`;
    });

    socket.on('disconnect', () => {
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