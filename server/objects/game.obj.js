function Game(lobby) {
    this.lobby = lobby;
    this.questions = [];
    this.round = 1;
    this.responses = {};

    for (var i = 0; i < lobby.players.length; i++) {
        lobby.players[i].score = 0;
        this.responses[lobby.players[i].id] = "-";
    }
}

Game.prototype.playerLeft = function(player){
    delete this.responses[player.id];
}

module.exports = Game;
