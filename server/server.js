const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const app = express();

const clientPath = `${__dirname}/../client`;
app.use(express.static(clientPath));

const server = http.createServer(app);

const io = socketIO(server);

var players = new Set();

let Player = require('./player');
let Stones = require('./stones');

const leftBoards = [0, 8, 16, 24, 32, 40, 48, 56]
const rightBoards = [7, 15, 23, 31, 39, 47, 55, 63]
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const createStones = () => {
    let stones = new Set();
    let randCountStones = getRandomInt(5, 10);
    for (let i = 0; i < randCountStones; i++) {
        let enemy = new Stones(getRandomInt(0, 63));
        stones.add(enemy);
    }
    return stones;
}

const isBusy = (firstPos, secondPos) => firstPos === secondPos;

const playerMoveCompleted = (player) => player.points === 0;

const refreshPlayersPoints = (players) => {
    players.forEach((item) => {
        item.points = getRandomInt(1, 6);
    })
}

const goUp = (curPosition) => {
    if (curPosition > 7) {
        return curPosition - 8;
    }
    return curPosition;
}
const goDown = (curPosition) => {
    if (curPosition < 56) {
        return curPosition + 8;
    }
    return curPosition;
}
const goLeft = (curPosition) => {
    if (leftBoards.indexOf(curPosition) === -1) {
        return curPosition - 1;
    }
    return curPosition;
};
const goRight = (curPosition) => {
    if (rightBoards.indexOf(curPosition) === -1) {
        return curPosition + 1;
    }
    return curPosition;
};

const arrayMove = ['KeyW', 'KeyS', 'KeyA', 'KeyD'];


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
            newPosition = goUp(newPosition);
            break;
        case 'KeyS':
            newPosition = goDown(newPosition);
            break;
        case 'KeyA':
            newPosition = goLeft(newPosition);
            break;
        case 'KeyD':
            newPosition = goRight(newPosition);
            break;
    }
    return newPosition;
}

let stonesArray = createStones();

const posIsBusyByPlayer = (players, data) => {
    if (typeof(data) === 'object') {
        data = typeof(data.position) === 'number' ? data.position : Number(data.position.slice(7));
    }
    let playersCollision = false;
    players.forEach((item) => {
        if (item.position !== null) {
            if (isBusy(data, Number(item.position.slice(7)))) {
                playersCollision = true;
            }
        }
    });
    return playersCollision;
}

const posIsBusyByStone = (stones, data) => {
    if (typeof(data) === 'object') {
        data = typeof(data.position) === 'number' ? data.position : Number(data.position.slice(7));
    }
    let stoneCollision = false;
    stones.forEach((item) => {
        if (isBusy(data, item.position)) {
            stoneCollision = true;
        }
    });
    return stoneCollision;

}

io.on('connection', (socket) => {

    let player = new Player(socket.id, getRandomInt(1, 6))
    players.add(player);
    console.log(player, 'подключился')

    let connected = {};
    connected.message = 'Вы подключились к игре!'
    connected.points = player.points;

    socket.emit('connected', connected);

    console.log('расстановка камней');
    let obj = {};
    stonesArray.forEach((item) => {
        obj.position = item.position;
        io.sockets.emit('spawn_stones', obj);
    });

    socket.on('first_player_position', (data) => {

        if (!posIsBusyByPlayer(players, data) && !posIsBusyByStone(stonesArray, data)) {
            player.set(data.position);
            players.add(player);
            io.sockets.emit('first_player_position', data);
            data.points = player.points;
            socket.emit('first_player_position', data)
        } else {
            console.log('нельзя выбирать занятую клетку');
            socket.emit('first_player_position-error', {
                message: 'нельзя выбирать занятую клетку',
                state: false,
            })
        }
    });

    socket.on('movement', (data) => {

        let move = data.move;
        let prewPosition = player.position;
        let newPosition = movement(move, prewPosition);

        //console.log(arrayMove.includes(move))

        if (!posIsBusyByPlayer(players, newPosition) && !posIsBusyByStone(stonesArray, newPosition)) {

            players.forEach((item) => {
                if (item.socket_id !== player.socket_id) {
                    pointsSecondPlayer = item.points
                }
            });

            player.set(`square-${newPosition}`);
            player.points -= 1;
            players.add(player);

            socket.broadcast.emit('movement', {
                newPos: newPosition,
                prewPos: prewPosition,
                points: pointsSecondPlayer,
            })

            socket.emit('movement', {
                newPos: newPosition,
                prewPos: prewPosition,
                points: player.points,
            });

            console.log(players);
        } else if (posIsBusyByPlayer(players, newPosition)) {

            players.forEach((item) => {
                if (item.socket_id !== player.socket_id) {
                    pointsSecondPlayer = item.points
                }
            });

            player.set(`square-${newPosition}`);
            player.points -= 1;
            players.add(player);

            socket.broadcast.emit('movement', {
                newPos: newPosition,
                prewPos: prewPosition,
                message: 'вы проиграли!',
                points: pointsSecondPlayer,
                gameOver: true,
            })

            socket.emit('movement', {
                newPos: newPosition,
                prewPos: prewPosition,
                points: player.points,
                message: 'вы выиграли!',
                gameOver: true,
            })

            console.log(players);
        }
    });

    socket.on('disconnect', () => {
        players.delete(player);
        console.log(player, 'отключился');
        io.sockets.emit('refresh')
        stonesArray = createStones();
    });

});


server.on('error', (err) => {
    console.log('Server error: ', err);
});

server.listen(5000, () => {
    console.log('Server started!')
});