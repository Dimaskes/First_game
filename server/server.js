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
    let randCountStones = getRandomInt(7, 15);
    for (let i = 0; i < randCountStones; i++) {
        let enemy = new Stones(getRandomInt(0, 63));
        stones.add(enemy);
    }
    return stones;
}

const isBusy = (firstPos, secondPos) => firstPos === secondPos;

const playersMoveCompleted = (players) => {
    let countOfPoints = 0;

    players.forEach((item) => {
        countOfPoints += item.points;
    })
    if (countOfPoints === 0) {
        return true;
    } else {
        return false;
    }
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
    if (!leftBoards.includes(curPosition)) {
        return curPosition - 1;
    }
    return curPosition;
};
const goRight = (curPosition) => {
    if (!rightBoards.includes(curPosition)) {
        return curPosition + 1;
    }
    return curPosition;
};


const arrayMove = ['KeyW', 'KeyS', 'KeyA', 'KeyD'];


function movement(strMove, busyClass) {
    let newPosition = Number(busyClass.slice(7));
    switch (strMove) {
        case 'ArrowUp':
            newPosition = goUpFire(newPosition);
            break;
        case 'ArrowDown':
            newPosition = goDownFire(newPosition);
            break;
        case 'ArrowLeft':
            newPosition = goLeftFire(newPosition);
            break;
        case 'ArrowRight':
            newPosition = goRightFire(newPosition);
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

const goUpFire = (nextFirePosition) => {
    firePosition = goUp(nextFirePosition);
    while (!posIsBusyByStone(stonesArray, firePosition) && !posIsBusyByPlayer(players, firePosition) && firePosition > 7) {
        nextFirePosition = firePosition;
        firePosition = goUp(nextFirePosition);
    }
    return firePosition
}

const goDownFire = (nextFirePosition) => {
    firePosition = goDown(nextFirePosition);
    while (!posIsBusyByStone(stonesArray, firePosition) && !posIsBusyByPlayer(players, firePosition) && firePosition < 56) {
        nextFirePosition = firePosition;
        firePosition = goDown(nextFirePosition);
    }
    return firePosition
}

const goLeftFire = (nextFirePosition) => {
    firePosition = goLeft(nextFirePosition);
    while (!posIsBusyByStone(stonesArray, firePosition) && !posIsBusyByPlayer(players, firePosition) && !leftBoards.includes(firePosition)) {
        nextFirePosition = firePosition;
        firePosition = goLeft(nextFirePosition);
    }
    return firePosition
}

const goRightFire = (nextFirePosition) => {
    firePosition = goRight(nextFirePosition);
    while (!posIsBusyByStone(stonesArray, firePosition) && !posIsBusyByPlayer(players, firePosition) && !rightBoards.includes(firePosition)) {
        nextFirePosition = firePosition;
        firePosition = goRight(nextFirePosition);
    }
    return firePosition
}



io.on('connection', (socket) => {

    let player = new Player(socket.id, getRandomInt(1, 6))
    players.add(player);
    console.log(player, 'подключился')

    let connected = {};
    connected.message = 'Вы подключились к игре!'
    connected.points = player.points;

    socket.json.emit('connected', connected);

    console.log('расстановка камней');
    let obj = {};
    stonesArray.forEach((item) => {
        obj.position = item.position;
        io.sockets.json.emit('spawn_stones', obj);
    });

    socket.json.on('first_player_position', (data) => {

        if (!posIsBusyByPlayer(players, data) && !posIsBusyByStone(stonesArray, data)) {
            player.set(data.position);
            players.add(player);
            io.sockets.json.emit('first_player_position', data);
            data.points = player.points;
            socket.json.emit('first_player_position', data)
        } else {
            console.log('нельзя выбирать занятую клетку');
            socket.json.emit('first_player_position-error', {
                message: 'нельзя выбирать занятую клетку',
                state: false,
            })
        }
    });

    socket.json.on('movement', (data) => {

        let move = data.move;
        let prewPosition = player.position;
        let newPosition = movement(move, prewPosition);

        if (!arrayMove.includes(move) && player.points >= 3) {
            console.log(movement(move, prewPosition))

            players.forEach((item) => {
                if (item.socket_id !== player.socket_id) {
                    pointsSecondPlayer = item.points
                }
            });

            if (posIsBusyByPlayer(players, newPosition) || posIsBusyByStone(stonesArray, newPosition)) {
                player.points -= 3;
                players.add(player);

                let curPlayer = {
                    newPos: newPosition,
                    prewPos: prewPosition,
                    points: player.points,
                    message: "вы уничтожили объект!",
                };
                let secPlayer = {
                    newPos: newPosition,
                    prewPos: prewPosition,
                    points: pointsSecondPlayer,
                    message: "противник уничтожил объект!",
                };

                socket.broadcast.json.emit('fire', secPlayer);

                socket.json.emit('fire', curPlayer);

                if (posIsBusyByPlayer(players, newPosition)) {
                    curPlayer.message = 'вы выиграли!';
                    secPlayer.message = 'вы проиграли!';
                    curPlayer.gameOver = secPlayer.gameOver = true;

                    socket.broadcast.json.emit('fire', secPlayer);
                    socket.json.emit('fire', curPlayer);
                }


                stonesArray.forEach((item) => {
                    if (item.position === newPosition) {
                        stonesArray.delete(item)
                    }
                })

            }
        }

        if (!posIsBusyByPlayer(players, newPosition) && !posIsBusyByStone(stonesArray, newPosition) && arrayMove.includes(move)) {

            players.forEach((item) => {
                if (item.socket_id !== player.socket_id) {
                    pointsSecondPlayer = item.points
                }
            });

            player.set(`square-${newPosition}`);
            player.points -= 1;
            players.add(player);

            socket.broadcast.json.emit('movement', {
                newPos: newPosition,
                prewPos: prewPosition,
                points: pointsSecondPlayer,
            })

            socket.json.emit('movement', {
                newPos: newPosition,
                prewPos: prewPosition,
                points: player.points,
            });

            console.log(players);
        } else if (posIsBusyByPlayer(players, newPosition) && arrayMove.includes(move)) {

            players.forEach((item) => {
                if (item.socket_id !== player.socket_id) {
                    pointsSecondPlayer = item.points
                }
            });

            player.set(`square-${newPosition}`);
            player.points -= 1;
            players.add(player);

            socket.broadcast.json.emit('movement', {
                newPos: newPosition,
                prewPos: prewPosition,
                message: 'вы проиграли!',
                points: pointsSecondPlayer,
                gameOver: true,
            })

            socket.json.emit('movement', {
                newPos: newPosition,
                prewPos: prewPosition,
                points: player.points,
                message: 'вы выиграли!',
                gameOver: true,
            })

        }

    });

    socket.json.on('waiting_next_round', () => {

        if (playersMoveCompleted(players)) {

            players.forEach((item) => {
                item.points = getRandomInt(1, 6);
            })

            players.forEach((item) => {
                if (item.socket_id !== player.socket_id) {
                    pointsSecondPlayer = item.points
                }
            });

            socket.json.emit('next_round', {
                points: player.points,
                message: 'новый раунд!',
            });
            socket.broadcast.json.emit('next_round', {
                points: pointsSecondPlayer,
                message: 'новый раунд!',
            });
        }

    });


    socket.json.on('disconnect', () => {
        players.delete(player);
        console.log(player, 'отключился');
        io.sockets.json.emit('refresh')
        stonesArray = createStones();
    });

});


server.on('error', (err) => {
    console.log('Серверная ошибка: ', err);
});

server.listen(5000, () => {
    console.log('Сервер запущен!')
});