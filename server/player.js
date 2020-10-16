class Player {

    constructor(socket_id) {
        this.socket_id = socket_id;
        this.state = 0;
        this.position = null;
    }

    set(position) {
        this.position = position;
        this.state = 1;
    }
    resetState() {
        this.state = 0;
    }
}

module.exports = Player;