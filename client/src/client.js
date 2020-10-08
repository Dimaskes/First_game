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

squareWrap.onclick = (e) => {
    e.target.classList.toggle('square-busy');
};

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


const writeEvent = (text) => {
    const parent = document.querySelector('.test_div');

    const elem = document.createElement('h1');
    elem.innerHTML = text;

    parent.appendChild(elem);
};

writeEvent('Hello!');
const sock = io();
sock.on('message', writeEvent);