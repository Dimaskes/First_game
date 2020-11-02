const squareWrap = document.querySelector('.square-wrap');
const btnNewGame = document.querySelector('.btn-newGame');
const btnDownload = document.querySelector('.btn-load');
const btnUpload = document.querySelector('.btn-upload');

const socket = io();
let firstPositionSelected = false;
let points = 0;
let gameOver = false;

(function renderBoard() {
    let count = 0;
    while (count < 8 * 8) {
        let item = document.createElement('div');
        squareWrap.appendChild(item);
        item.classList.add('square');
        item.classList.add(`square-${count}`)
        count++;
    }
}());

function renderMessage(message) {
    document.querySelector('.card-text').innerHTML += `${message}</br>`;
}

function renderPlayerPoints(points) {
    document.querySelector('.list-group-item').innerHTML = points;
}

const spawnStones = (position) => {
    let tmp = `square-${position}`;
    let tmpClassElem = document.querySelector(`.${tmp}`);
    tmpClassElem.classList.add('square-busy_enemy');
};

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp':
            getPressedKey = 'ArrowUp';
            break;
        case 'ArrowDown':
            getPressedKey = 'ArrowDown';
            break;
        case 'ArrowLeft':
            getPressedKey = 'ArrowLeft';
            break;
        case 'ArrowRight':
            getPressedKey = 'ArrowRight';
            break;
        case 'KeyW':
            getPressedKey = 'KeyW';
            break;
        case 'KeyS':
            getPressedKey = 'KeyS';
            break;
        case 'KeyA':
            getPressedKey = 'KeyA';
            break;
        case 'KeyD':
            getPressedKey = 'KeyD';
            break;
    }
    if (firstPositionSelected && points > 0 && !gameOver) {
        socket.json.emit('movement', {
            playerID: socket.id,
            move: getPressedKey,
            points: points,
        });
    }
});

squareWrap.addEventListener('click', (e) => {
    if (!firstPositionSelected) {
        socket.json.emit('first_player_position', {
            position: e.target.classList[1]
        });
        firstPositionSelected = true;
    }
});

socket.json.on('first_player_position-error', data => {
    firstPositionSelected = data.state;
    renderMessage(data.message);
});

socket.json.on('select-player', data => {

    points = data.points;
    renderPlayerPoints(data.points);
    renderMessage(data.message);

    if (!data.state) {
        let isConfirm = confirm("Противник загрузил сохраненную игру\nОК-загрузить\nCancel-обновить страницу");

        if (isConfirm) {
            socket.json.emit('select-player')
        } else {
            window.location.reload();
        }
    }
});

socket.json.on('first_player_position', data => {
    let selectedPosition = document.querySelector(`.${data.position}`);
    selectedPosition.classList.add('square-busy_player');
});

socket.json.on('spawn_stones', data => {
    spawnStones(data.position);
});

socket.json.on('connected', data => {
    points = data.points
    renderPlayerPoints(data.points);
    renderMessage(data.message);
});

socket.json.on('movement', data => {

    if (`square-${data.prewPos}` !== `square-${data.newPos}`) {
        points = data.points;
        renderPlayerPoints(data.points);

        let newPlayerPosition = document.querySelector(`.square-${data.newPos}`);
        newPlayerPosition.classList.add('square-busy_player');
        let prewPlayerPosition = document.querySelector(`.square-${data.prewPos}`);
        prewPlayerPosition.classList.remove('square-busy_player');

        if (data.message === 'вы выиграли!' || data.message === 'вы проиграли!') {
            document.querySelector('.card-text').innerHTML += `<strong>${data.message}</strong></br>`;
            gameOver = data.gameOver;
        }
        if (points === 0 && !gameOver) {
            socket.json.emit('waiting_next_round');
        }
    }
});

socket.json.on('fire', data => {

    if (`square-${data.prewPos}` !== `square-${data.newPos}`) {
        points = data.points;
        renderPlayerPoints(data.points);

        let prewPlayerPosition = document.querySelector(`.square-${data.newPos}`);
        prewPlayerPosition.classList.remove('square-busy_enemy');

        if (data.message === 'вы выиграли!' || data.message === 'вы проиграли!') {
            document.querySelector('.card-text').innerHTML += `<strong>${data.message}</strong></br>`;
            prewPlayerPosition.classList.remove('square-busy_player');
            gameOver = data.gameOver;
        } else {
            renderMessage(data.message);
        }
        if (points === 0 && !gameOver) {
            socket.json.emit('waiting_next_round');
        }
    }
});

btnNewGame.addEventListener('click', () => {

    if (gameOver) {
        window.location.reload();
    } else {
        renderMessage(`Начать новую игру можно после завершения текущей`);
    }
});

socket.json.on('next_round', data => {
    points = data.points;
    renderPlayerPoints(data.points);
    renderMessage(data.message);
});

socket.json.on('refresh', () => {
    window.location.reload();
});

btnDownload.addEventListener('click', () => {
    socket.emit('download-gameSate')
});

socket.json.on('download-gameSate', (data) => {
    renderMessage(data.message);
})

socket.json.on('uploadedState', (data) => {
    renderMessage(data.message);
})

btnUpload.addEventListener('change', () => {
    let fileName = btnUpload.files.item(0).name;
    socket.json.emit('upload-gameState', fileName);
})

socket.json.on('delete_stones', (data) => {
    let stonePosition = document.querySelector(`.square-${data.position}`);
    stonePosition.classList.remove('square-busy_enemy');
    firstPositionSelected = true;
});

socket.json.on('delete_players', (data) => {
    let playerPosition = document.querySelector(`.${data.position}`);
    playerPosition.classList.remove('square-busy_player');
})