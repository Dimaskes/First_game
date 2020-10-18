class Enemy {

    constructor(position) {
        this.position = position;
        this.state = 0;
    }

    set(position) {
        this.position = position
        this.state = 1;
    }
    resetState() {
        this.state = 0;
    }
}

module.exports = Enemy;