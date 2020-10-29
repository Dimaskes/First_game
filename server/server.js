const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const app = express();

const clientPath = `${__dirname}/../client`;
app.use(express.static(clientPath));

const server = http.createServer(app);
const io = socketIO(server);

let players = new Set();
let fs = require('fs');
let Player = require('./player');
let Stones = require('./stones');
let action = require("./actions.js");
let isBusy = require("./isBusyPosition.js");

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

const arrayMove = ['KeyW', 'KeyS', 'KeyA', 'KeyD'];

function movement(strMove, newPosition) {
    switch (strMove) {
        case 'ArrowUp':
            newPosition = action.goUpFire(newPosition, stonesArray, players);
            break;
        case 'ArrowDown':
            newPosition = action.goDownFire(newPosition, stonesArray, players);
            break;
        case 'ArrowLeft':
            newPosition = action.goLeftFire(newPosition, stonesArray, players);
            break;
        case 'ArrowRight':
            newPosition = action.goRightFire(newPosition, stonesArray, players);
            break;
        case 'KeyW':
            newPosition = action.goUp(newPosition);
            break;
        case 'KeyS':
            newPosition = action.goDown(newPosition);
            break;
        case 'KeyA':
            newPosition = action.goLeft(newPosition);
            break;
        case 'KeyD':
            newPosition = action.goRight(newPosition);
            break;
    }
    return newPosition;
}

let stonesArray = createStones();

io.on('connection', (socket) => {
    console.log(players)

    let player = new Player(socket.id, getRandomInt(1, 6))
    players.add(player);
    console.log(player, 'подключился')

    socket.json.emit('connected', {
        message: 'Вы подключились к игре!',
        points: player.points,
    });

    let stone_obj = {};
    stonesArray.forEach((item) => {
        stone_obj.position = item.position;
        io.sockets.json.emit('spawn_stones', stone_obj);
    });

    socket.json.on('first_player_position', (data) => {

        if (!isBusy.byPlayer(players, data) && !isBusy.byStone(stonesArray, data)) {
            player.set(data.position);
            players.add(player);
            io.sockets.json.emit('first_player_position', data);
        } else {
            socket.json.emit('first_player_position-error', {
                message: 'нельзя выбирать занятую клетку',
                state: false,
            })
        }
    });

    socket.json.on('movement', (data) => {

        let move = data.move;
        let prewPosition = Number(player.position.slice(7));
        let newPosition = movement(move, prewPosition);

        if (!arrayMove.includes(move) && player.points >= 3) {
            players.forEach((item) => {
                if (item.socket_id !== player.socket_id) {
                    pointsSecondPlayer = item.points
                }
            });

            if (isBusy.byPlayer(players, newPosition) || isBusy.byStone(stonesArray, newPosition)) {
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

                socket.json.emit('fire', curPlayer);
                socket.broadcast.json.emit('fire', secPlayer);

                if (isBusy.byPlayer(players, newPosition)) {
                    curPlayer.message = 'вы выиграли!';
                    secPlayer.message = 'вы проиграли!';
                    curPlayer.gameOver = secPlayer.gameOver = true;

                    socket.json.emit('fire', curPlayer);
                    socket.broadcast.json.emit('fire', secPlayer);

                    console.log(`Игра окончена. Победил игрок socketID: ${player.socket_id}`);
                }

                stonesArray.forEach((item) => {
                    if (item.position === newPosition) {
                        stonesArray.delete(item)
                    }
                })
            }
        }

        if (!isBusy.byPlayer(players, newPosition) && !isBusy.byStone(stonesArray, newPosition) && arrayMove.includes(move)) {

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

            console.log(players)

        } else if (isBusy.byPlayer(players, newPosition) && arrayMove.includes(move)) {

            players.forEach((item) => {
                if (item.socket_id !== player.socket_id) {
                    pointsSecondPlayer = item.points
                }
            });

            player.set(`square-${newPosition}`);
            if (newPosition !== prewPosition) {
                player.points -= 1;
            }
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

            console.log(`Игра окончена. Победил игрок socketID: ${player.socket_id}`);
        }

    });

    socket.json.on('waiting_next_round', () => {

        if (playersMoveCompleted(players) && !player.gameOver) {

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

    // скачивание общего объекта Game с сотоянием игры
    socket.json.on('download-gameSate', () => {
        let game = {};
        game.players = [...players];
        game.stones = [...stonesArray];
        json_game = JSON.stringify(game, null, 2);
        fs.writeFile('game.json', json_game, function(err) {
            if (err) {
                console.log('Произошла ошибка при записи файла ', err);
            }
        });
    })

    socket.json.on('upload-gameState', (filename) => {

        fs.readFile(`${filename}`, function(err, data) {
            if (err) throw err;
            let gameArr = data.toString();
            gameArr = JSON.parse(gameArr);

            // load stones
            stonesArray.forEach((item) => {
                io.sockets.json.emit('delete_stones', { position: item.position });
                stonesArray.delete(item);
            });
            gameArr.stones.forEach((item) => {
                stonesArray.add(item);
                io.sockets.json.emit('spawn_stones', { position: item.position });
            });

            // load players
            players.forEach((item) => {
                io.sockets.json.emit('delete_players', { position: item.position });
                players.delete(item);
            })
            uploadedPlayers = new Set();
            gameArr.players.forEach((item) => {
                uploadedPlayers.add(item);
                io.sockets.json.emit('first_player_position', { position: item.position });
            })

            player.clear();
            gameArr.players.forEach((item) => {
                if (item.socket_id !== player.socket_id) {
                    player.socket_id = reserveID = item.socket_id;
                    player.position = item.position;
                    player.points = item.points;
                }
            })
            players.add(player);

            socket.json.emit('select-player', {
                points: player.points,
                position: player.position,
                message: `ожидание второго игрока, ваш персонаж на позиции ${player.position}`,
                state: true,
            })
            socket.broadcast.json.emit('select-player', {
                points: 0,
                message: 'ожидание подтверждения загрузки игры',
                state: false,
            })
        })
    })

    socket.json.on('select-player', () => {

        player.clear();
        uploadedPlayers.forEach((item) => {
            if (item.socket_id !== reserveID) {
                player.socket_id = item.socket_id;
                player.position = item.position;
                player.points = item.points;
            }
        })
        players.add(player)

        let pointsSecondPlayer;
        players.forEach((item) => {
            if (item.socket_id !== player.socket_id) {
                pointsSecondPlayer = item.points
            }
        });

        socket.json.emit('select-player', {
            points: player.points,
            state: true,
            message: `игра продолжается! Ваш персонаж на позиции ${player.position}`,
        })
        socket.broadcast.json.emit('select-player', {
            points: pointsSecondPlayer,
            state: true,
            message: 'игра продолжается!'
        })
    })



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