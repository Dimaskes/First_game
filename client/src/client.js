const squareWrap = document.querySelector('.square-wrap');
const btnNewGame = document.querySelector('.btn-newGame');
const btnDownload = document.querySelector('.btn-load');
const btnUpload = document.querySelector('.btn-upload');

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

const socket = io();
let firstPositionSelected = false;
let points = 0;
let gameOver = false;

squareWrap.addEventListener('click', (e) => {
    if (!firstPositionSelected) {
        socket.json.emit('first_player_position', {
            playerID: socket.id,
            position: e.target.classList[1]
        });
        firstPositionSelected = true;
    }
});


socket.json.on('first_player_position-error', data => {
    firstPositionSelected = data.state;
    document.querySelector('.card-text').innerHTML += `${data.message}</br>`;
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
    document.querySelector('.list-group-item').innerHTML = data.points;
    document.querySelector('.card-text').innerHTML += `${data.message}</br>`;
});

socket.json.on('movement', data => {
    if (`square-${data.prewPos}` !== `square-${data.newPos}`) {
        points = data.points;
        document.querySelector('.list-group-item').innerHTML = points;
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
        document.querySelector('.list-group-item').innerHTML = points;
        let prewPlayerPosition = document.querySelector(`.square-${data.newPos}`);
        prewPlayerPosition.classList.remove('square-busy_enemy');
        if (data.message === 'вы выиграли!' || data.message === 'вы проиграли!') {
            document.querySelector('.card-text').innerHTML += `<strong>${data.message}</strong></br>`;
            prewPlayerPosition.classList.remove('square-busy_player');
            gameOver = data.gameOver;
        } else {
            document.querySelector('.card-text').innerHTML += `${data.message}</br>`;
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
        document.querySelector('.card-text').innerHTML += `<br>Начать новую игру можно после завершения текущей</br>`;
    }
});


socket.json.on('next_round', data => {
    points = data.points;
    document.querySelector('.list-group-item').innerHTML = points;
    document.querySelector('.card-text').innerHTML += `${data.message}</br>`;
});

socket.json.on('refresh', () => {
    window.location.reload();
});


btnDownload.addEventListener('click', () => {
    socket.emit('download-gameSate')
});

btnUpload.addEventListener('change', () => {
    let fileName = btnUpload.files.item(0).name;
    socket.json.emit('upload-gameState', fileName)
})

socket.json.on('delete_stones', (data) => {
    let stonePosition = document.querySelector(`.square-${data.position}`);
    stonePosition.classList.remove('square-busy_enemy');
})