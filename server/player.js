class Player {

    constructor(socket_id, points) {
        this.socket_id = socket_id;
        this.points = points;
        this.position = null;
    }

    set(position) {
        this.position = position;

    }
}

module.exports = Player;