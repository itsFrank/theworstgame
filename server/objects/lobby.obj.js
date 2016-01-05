function Lobby(id, host) {
    this.id = id;
    this.host = host;
    this.players = {};
    this.players[host.id] = host;
    this.game = null;
    this.states = {
        waiting : 0,
        playing : 1
    };
    this.state = 0;

    host.lobby_id = id;
}

Lobby.prototype.hasPlayer = function(player){
    return this.hasPlayerId(player.id);
};

Lobby.prototype.hasPlayerId = function(id){
    return this.players.hasOwnProperty(id);
};

Lobby.prototype.addPlayer = function(player){
    if (this.state == this.states.playing) {
        console.log('ERR: LOBBY IN PLAY STATE');
        return false;
    }
    if (this.hasPlayer(player)) {
        console.log('ERR: PLAYER ALREADY IN LOBBY');
        return false;
    }

    this.players[player.id] = player;
    player.lobby_id = this.id;
    return true;
};

Lobby.prototype.removePlayer = function(player) {
    if (this.hasPlayer(player)) {
        if (this.state == this.states.playing) {
            this.game.playerLeft(player);
        }

        delete this.players[player.id];
    }else {
        console.log('ERR: PLAYER NOT FOUND IN ARRAY, NO DELETION');
    }
};

Lobby.prototype.playerDisconnected = function(player){
    this.removePlayer(player);
};

Lobby.prototype.startGame = function(){};


module.exports = Lobby;
