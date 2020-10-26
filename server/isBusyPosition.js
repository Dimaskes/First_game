module.exports = {
    byPlayer: function(players, data) {
        if (typeof(data) === 'object') {
            data = typeof(data.position) === 'number' ? data.position : Number(data.position.slice(7));
        }
        let playersCollision = false;
        players.forEach((item) => {
            if (item.position !== null) {
                if (isBusy(data, Number(item.position.slice(7)))) {
                    playersCollision = true;
                }
            }
        });
        return playersCollision;
    },
    byStone: function(stones, data) {
        if (typeof(data) === 'object') {
            data = typeof(data.position) === 'number' ? data.position : Number(data.position.slice(7));
        }
        let stoneCollision = false;
        stones.forEach((item) => {
            if (isBusy(data, item.position)) {
                stoneCollision = true;
            }
        });
        return stoneCollision;
    }
}

const isBusy = (firstPos, secondPos) => firstPos === secondPos;