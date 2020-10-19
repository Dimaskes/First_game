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

const isBusy = (firstPos, secondPos) => firstPos === secondPos;

const playersMoveCompleted = (players) => {
    let tmp = 0;
    players.forEach((item) => {
        tmp += item.state;
    });
    if (tmp === 2) {
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
        player.set(data.position);
        players.add(player);
        io.sockets.emit('first_player_position', data);
        console.log(players);

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


        // let playersCollision = false;

        // console.log(Array.from(players).some(function(item) {
        //     item === null
        // }))

        // if (!Array.from(players).some(function(item) {
        //         item[1] === null
        //     })) {
        //     players.forEach((item) => {
        //         console.log(data.position, item.position)
        //         if (isBusy(Number(data.position.slice(7)), Number(item.position.slice(7)))) {
        //             playersCollision = true
        //         }
        //     });
        // }

        // if (!playersCoalision) {
        //     player.set(data.position);
        //     players.add(player);
        //     io.sockets.emit('first_player_position', data);
        // } else {
        //     console.log('нельзя занимать одну клетку')
        // }
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

            console.log(players);
        }
    });

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