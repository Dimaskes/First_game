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
    if (firstPositionSelected) { // && !moveCompleted
        socket.emit('movement', {
            playerID: socket.id,
            move: getPressedKey,
        });
    }

});

const socket = io();

squareWrap.addEventListener('click', (e) => {
    if (!firstPositionSelected) {
        socket.emit('first_player_position', {
            playerID: socket.id,
            position: e.target.classList[1]
        });
        firstPositionSelected = true;
        moveCompleted = 1;
    }
});


socket.on('first_player_position', data => {
    let selectedPosition = document.querySelector(`.${data.position}`);
    selectedPosition.classList.add('square-busy_player');
});

socket.on('spawn_enemies', data => {
    console.log(data);
})


socket.on('movement', data => {

    if (data.prewPos !== `square-${data.newPos}`) { // && !moveCompleted
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