const squareWrap = document.querySelector('.square-wrap');

const board = () => {
    let count = 0;
    while (count < 8 * 8) {
        let item = document.createElement('div');
        squareWrap.appendChild(item);
        item.classList.add('square');
        item.classList.add(`square-${count}`)
        count++;
    }
};

board();

let firstPositionSelected = false;

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
        socket.emit('movement', {
            playerID: socket.id,
            move: getPressedKey,
            points: points,
        });
    }

});

const socket = io();
let points = 0;
let gameOver = false;

squareWrap.addEventListener('click', (e) => {
    if (!firstPositionSelected) {
        socket.emit('first_player_position', {
            playerID: socket.id,
            position: e.target.classList[1]
        });
        firstPositionSelected = true;
    }
});


socket.on('first_player_position-error', data => {
    firstPositionSelected = data.state;
    document.querySelector('.card-text').innerHTML += `${data.message}</br>`;

})


socket.on('first_player_position', data => {
    let selectedPosition = document.querySelector(`.${data.position}`);
    selectedPosition.classList.add('square-busy_player');
});

socket.on('spawn_stones', data => {
    spawnStones(data.position);
})


socket.on('connected', data => {
    points = data.points
    document.querySelector('.list-group-item').innerHTML = data.points;
    document.querySelector('.card-text').innerHTML += `${data.message}</br>`;

})

socket.on('movement', data => {
    if (data.prewPos !== `square-${data.newPos}`) {
        points = data.points;
        document.querySelector('.list-group-item').innerHTML = points;
        let newPlayerPosition = document.querySelector(`.square-${data.newPos}`);
        newPlayerPosition.classList.add('square-busy_player');
        let prewPlayerPosition = document.querySelector(`.${data.prewPos}`);
        prewPlayerPosition.classList.remove('square-busy_player');
        if (data.message === 'вы выиграли!' || data.message === 'вы проиграли!') {
            document.querySelector('.card-text').innerHTML += `<strong>${data.message}</strong></br>`;
            gameOver = data.gameOver;
        }
        if (points === 0) {
            socket.emit('waiting_next_round');
        }
    }
})


socket.on('next_round', data => {
    points = data.points;
    document.querySelector('.list-group-item').innerHTML = points;
    document.querySelector('.card-text').innerHTML += `${data.message}</br>`;
})

socket.on('refresh', () => {
    window.location.reload();
})