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
    console.log(getPressedKey);
});

const socket = io();

squareWrap.addEventListener('click', (e) => {
    socket.emit('player_clicked', {
        playerID: socket.id,
        position: e.target.classList[1]
    });
});


socket.on('player_clicked', data => {
    let tmp = document.querySelector(`.${data.position}`);
    tmp.classList.add('square-busy_player');
});