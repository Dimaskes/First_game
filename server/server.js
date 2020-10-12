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

const leftBoards = [0, 8, 16, 24, 32, 40, 48, 56]
const rightBoards = [7, 15, 23, 31, 39, 47, 55, 63]
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const isBusy = (prewPosition, newPosition) => prewPosition === newPosition;

function movement(strMove, busyClass) {
    let newPosition = Number(busyClass.slice(7));
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
            if (newPosition > 7) {
                newPosition -= 8;
            }
            break;
        case 'KeyS':
            if (newPosition < 56) {
                newPosition += 8;
            }
            break;
        case 'KeyA':
            if (leftBoards.indexOf(newPosition) === -1) {
                newPosition -= 1;
            }
            break;
        case 'KeyD':
            if (rightBoards.indexOf(newPosition) === -1) {
                newPosition += 1;
            }
            break;
    }
    return newPosition;
}


io.on('connection', (socket) => {

    if (players.size < 1) {
        player = {
            socketID: socket.id,
            playNum: 1,
        };
        players.add(player);
        console.log(player, 'connected');
    } else if (players.size < 2) {
        player = {
            socketID: socket.id,
            playNum: 2,
        };
        players.add(player);
        console.log(player, 'connected');
    } else {
        console.log('connect error! >2 players');
    }

    socket.on('first_player_position', (data) => {
        player.busyClass = data.position;
        players.add(player);
        io.sockets.emit('first_player_position', data);
        console.log(player);
        console.log(players)
    });

    socket.on('movement', (data) => {
        console.log(players);
        let move = data.move;
        let prewPosition = player.busyClass;
        let newPosition = movement(move, prewPosition);
        io.sockets.emit('movement', {
            newPos: newPosition,
            prewPos: prewPosition
        });
        player.busyClass = `square-${newPosition}`;
        players.add(player);

    });

    socket.on('disconnect', () => {
        players.delete(player);
        console.log(player, 'отключился');
    });

});


server.on('error', (err) => {
    console.log('Server error: ', err);
});

server.listen(5000, () => {
    console.log('Server started!')
});