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

let getPressedKey = '';
let stateFirstPosition = true;
let stateStepFinished = 0;

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
    if (!stateFirstPosition && !stateStepFinished) {
        socket.emit('movement', {
            playerID: socket.id,
            move: getPressedKey,
        });
    }

});

const socket = io();

squareWrap.addEventListener('click', (e) => {
    if (stateFirstPosition) {
        socket.emit('first_player_position', {
            playerID: socket.id,
            position: e.target.classList[1]
        });
        stateFirstPosition = false;
        stateStepFinished = 1;
    }
});


socket.on('first_player_position', data => {
    let tmp = document.querySelector(`.${data.position}`);
    tmp.classList.add('square-busy_player');
});


socket.on('movement', data => {

    if (data.prewPos !== `square-${data.newPos}` && !stateStepFinished) {
        let tmp = document.querySelector(`.square-${data.newPos}`);
        tmp.classList.add('square-busy_player');
        let tmp2 = document.querySelector(`.${data.prewPos}`);
        tmp2.classList.remove('square-busy_player');
        stateStepFinished = data.state;
        console.log(data)
    }
})