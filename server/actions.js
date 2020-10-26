const leftBoards = [0, 8, 16, 24, 32, 40, 48, 56];
const rightBoards = [7, 15, 23, 31, 39, 47, 55, 63];

let isBusy = require("./isBusyPosition.js");

module.exports = {
    goUp: function(curPosition) {
        if (curPosition > 7) {
            return curPosition - 8;
        }
        return curPosition;
    },
    goDown: function(curPosition) {
        if (curPosition < 56) {
            return curPosition + 8;
        }
        return curPosition;

    },
    goLeft: function(curPosition) {
        if (!leftBoards.includes(curPosition)) {
            return curPosition - 1;
        }
        return curPosition;

    },
    goRight: function(curPosition) {
        if (!rightBoards.includes(curPosition)) {
            return curPosition + 1;
        }
        return curPosition;
    },
    goUpFire: function(nextFirePosition, stonesArray, players) {
        firePosition = module.exports.goUp(nextFirePosition);
        while (!isBusy.byStone(stonesArray, firePosition) && !isBusy.byPlayer(players, firePosition) && firePosition > 7) {
            nextFirePosition = firePosition;
            firePosition = module.exports.goUp(nextFirePosition);
        }
        return firePosition
    },
    goDownFire: function(nextFirePosition, stonesArray, players) {
        firePosition = module.exports.goDown(nextFirePosition);
        while (!isBusy.byStone(stonesArray, firePosition) && !isBusy.byPlayer(players, firePosition) && firePosition < 56) {
            nextFirePosition = firePosition;
            firePosition = module.exports.goDown(nextFirePosition);
        }
        return firePosition
    },
    goRightFire: function(nextFirePosition, stonesArray, players) {
        firePosition = module.exports.goRight(nextFirePosition);
        while (!isBusy.byStone(stonesArray, firePosition) && !isBusy.byPlayer(players, firePosition) && !rightBoards.includes(firePosition)) {
            nextFirePosition = firePosition;
            firePosition = module.exports.goRight(nextFirePosition);
        }
        return firePosition
    },
    goLeftFire: function(nextFirePosition, stonesArray, players) {
        firePosition = module.exports.goLeft(nextFirePosition);
        while (!isBusy.byStone(stonesArray, firePosition) && !isBusy.byPlayer(players, firePosition) && !leftBoards.includes(firePosition)) {
            nextFirePosition = firePosition;
            firePosition = module.exports.goLeft(nextFirePosition);
        }
        return firePosition
    },
}