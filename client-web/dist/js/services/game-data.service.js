app.factory('$gameData', function(){
    var game_data = {
        player : null,
        lobby : null,
        currentScope: {}
    };

    game_data.addPlayer = function(player){
        game_data.lobby.players[player.id] = player;
        game_data.currentScope.$apply();
    };

    game_data.removePlayer = function(player){
        delete game_data.lobby.players[player.id];
        game_data.currentScope.$apply();
    };

    return game_data;
});
