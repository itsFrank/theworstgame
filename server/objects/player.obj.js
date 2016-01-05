function Player(id) {
    this.id = id;
    this.name = '';
    this.ishost = false;
    this.score = 0;
    this.wins = 0;
    this.lobby_id = null;
    console.log(id + ' created!');
}

module.exports = Player;
