// пересечения - убийства
// стрельба
// завершение игры

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
let Enemy = require('./enemy');

const leftBoards = [0, 8, 16, 24, 32, 40, 48, 56]
const rightBoards = [7, 15, 23, 31, 39, 47, 55, 63]
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const createEnemies = () => {
    let enemies = new Set();
    for (let i = 0; i < 4; i++) {
        let enemy = new Enemy(getRandomInt(0, 31));
        enemies.add(enemy);
    }
    return enemies;
}


const moveEnemies = (enemies) => {
    let curPositions = [];
    enemiesArray.forEach((item) => curPositions.push(item.position))
    enemies.forEach((item) => {
        let numOfFunctionMove = getRandomInt(0, 3);
        item.prewPos = item.position;
        if (!curPositions.includes(arrMoveFunctions[numOfFunctionMove](item.position))) {
            item.position = arrMoveFunctions[numOfFunctionMove](item.position);
        }
    })
    return enemies;
}

const isBusy = (firstPos, secondPos) => firstPos === secondPos;

const playersMoveCompleted = (players) => {
    let count = 0;
    players.forEach((item) => {
        count += item.state;
    });
    if (count === 2) {
        return true;
    }
    return false;
}

const resetPlayersState = (players) => {
    players.forEach((item) => {
        item.state = 0;
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

const arrMoveFunctions = [goDown, goUp, goLeft, goRight]

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


io.on('connection', (socket) => {

    let player = new Player(socket.id)
    players.add(player);
    console.log(player, 'подключился')

    socket.on('first_player_position', (data) => {

        let countNullFirstPos = 0;

        players.forEach((item) => {
            if (item.position === null)
                countNullFirstPos += 1;
        });

        if (countNullFirstPos === 2) {
            player.set(data.position);
            players.add(player);
            io.sockets.emit('first_player_position', data);
            console.log(players);
        } else {
            let playersCollision = false;

            players.forEach((item) => {
                if (item.position !== null) {
                    if (isBusy(Number(data.position.slice(7)), Number(item.position.slice(7)))) {
                        playersCollision = true;
                    }
                }
            });

            if (!playersCollision) {
                player.set(data.position);
                players.add(player);
                io.sockets.emit('first_player_position', data);
            } else {
                console.log('нельзя занимать одну клетку')
                socket.emit('first_player_position-error', {
                    message: 'вы выбрали занятую клетку',
                    state: false,
                })
            }

            if (playersMoveCompleted(players)) {
                console.log('создание врагов');
                enemiesArray = createEnemies();
                let obj = {};
                enemiesArray.forEach((item) => {
                    obj.position = item.position;
                    io.sockets.emit('spawn_enemies', obj);
                });
                resetPlayersState(players);
            }
        }
    });


    socket.on('movement', (data) => {

        let move = data.move;
        let prewPosition = player.position;
        let newPosition = movement(move, prewPosition);

        let playersCollision = false;
        players.forEach((item) => {
            if (isBusy(newPosition, Number(item.position.slice(7)))) {
                playersCollision = true;
            }
        });

        if (!playersCollision) {

            player.set(`square-${newPosition}`);
            players.add(player);

            socket.broadcast.emit('movement', {
                newPos: newPosition,
                prewPos: prewPosition,
                state: 0,
            })

            socket.emit('movement', {
                newPos: newPosition,
                prewPos: prewPosition,
                state: player.state,
            });

            if (playersMoveCompleted(players)) {
                console.log('ход врагов');
                console.log(enemiesArray, '\n');
                //console.log(enemiesArray)
                enemiesArray = moveEnemies(enemiesArray);
                let obj = {};
                enemiesArray.forEach((item) => {
                    obj.newPos = item.position;
                    obj.prewPos = item.prewPos;
                    io.sockets.emit('enemies_move', obj);
                });
                resetPlayersState(players);

                console.log(enemiesArray);
            }

            console.log(players);
        }
    });

    // if (playersMoveCompleted(players)) {
    //     console.log('ход врагов');
    //     enemiesArray = moveEnemies(enemiesArray);
    //     moveEnemies();
    //     let obj = {};
    //     // enemiesArray.forEach((item) => {
    //     //     obj.newPos = item.position,
    //     //         obj.prewPos = item.prewPos
    //     // });
    //     io.sockets.emit('enemies_move', obj)
    // }
    // io.sockets.emit('enemies_move', (obj) => {
    //     console.log('ход врагов');
    //     enemiesArray = moveEnemies(enemiesArray);
    //     moveEnemies();
    //     obj.newPos = 0;
    //     obj.prewPos = 1;
    // })

    socket.on('disconnect', () => {
        players.delete(player);
        console.log(player, 'отключился');
        io.sockets.emit('refresh')
    });

});


server.on('error', (err) => {
    console.log('Server error: ', err);
});

server.listen(5000, () => {
    console.log('Server started!')
});