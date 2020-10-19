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
let moveCompleted = 0;

const spawnEnemy = (position) => {
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
    if (firstPositionSelected && !moveCompleted) {
        socket.emit('movement', {
            playerID: socket.id,
            move: getPressedKey,
        });
    }

});

const socket = io();

squareWrap.addEventListener('click', (e) => {
    if (!firstPositionSelected && Number(e.target.classList[1].slice(7)) > 31) {
        socket.emit('first_player_position', {
            playerID: socket.id,
            position: e.target.classList[1]
        });
        firstPositionSelected = true;
        moveCompleted = 1;
    }
});

socket.on('first_player_position-error', data => {
    firstPositionSelected = data.state;
    console.log(data.message);
})


socket.on('first_player_position', data => {
    let selectedPosition = document.querySelector(`.${data.position}`);
    selectedPosition.classList.add('square-busy_player');
});

socket.on('spawn_enemies', data => {
    spawnEnemy(data.position);
    moveCompleted = 0;
})

socket.on('enemies_move', data => {
    if (data.prewPos !== data.newPos) {
        let newEnemyPosition = document.querySelector(`.square-${data.newPos}`);
        newEnemyPosition.classList.add('square-busy_enemy');
        let prewEnemyrPosition = document.querySelector(`.square-${data.prewPos}`);
        prewEnemyrPosition.classList.remove('square-busy_enemy');
        moveCompleted = 0;
    }

})

socket.on('movement', data => {
    if (data.prewPos !== `square-${data.newPos}`) {
        let newPlayerPosition = document.querySelector(`.square-${data.newPos}`);
        newPlayerPosition.classList.add('square-busy_player');
        let prewPlayerPosition = document.querySelector(`.${data.prewPos}`);
        prewPlayerPosition.classList.remove('square-busy_player');
        moveCompleted = data.state;
    }
})

socket.on('refresh', () => {
    window.location.reload();
})