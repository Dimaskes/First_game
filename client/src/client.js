const squareWrap = document.querySelector('.square-wrap');

const board = () => {
    let i = 0,
        count = 0;
    while (count < 8 * 8) {
        let item = document.createElement('div');
        squareWrap.appendChild(item);
        item.classList.add('square');
        item.classList.add(`square-${count}`)
        i += ((i + 2) % 9) ? 1 : 2;
        count++;
    }
};

board();

squareWrap.onclick = (e) => {
    e.target.classList.toggle('square-busy');
};


const writeEvent = (text) => {
    const parent = document.querySelector('.test_div');

    const elem = document.createElement('h1');
    elem.innerHTML = text;

    parent.appendChild(elem);
};

writeEvent('Hello!');
const sock = io();
sock.on('message', writeEvent);