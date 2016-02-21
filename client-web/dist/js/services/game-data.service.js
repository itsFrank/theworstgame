app.factory('$gameData', function(){
    var game_data = {
        player : null,
        lobby : null,
        currentScope: {},
        questions : [],
        current_question : 0,
        responses: {},
        game_state : null
    };

    game_data.addPlayer = function(player){
        game_data.lobby.players[player.id] = player;
        game_data.currentScope.$apply();
    };

    game_data.removePlayer = function(player){
        delete game_data.lobby.players[player.id];
        game_data.currentScope.$apply();
    };

    game_data.newGame = function(question_array){
        game_data.questions = question_array;
        game_data.current_question = 0;
    };

    game_data.addResponse = function(response, player){
        responses[player] = response;
    };

    game_data.numPlayers = function(){
        var size = 0, key;
        for (key in game_data.lobby.players) {
            if (game_data.lobby.players.hasOwnProperty(key)) size++;
        }
        return size;
    };

    game_data.numResponses = function(){
        var size = 0, key;
        for (key in game_data.responses) {
            if (game_data.responses.hasOwnProperty(key)) size++;
        }
        return size;
    };

    game_data.numVotes = function(){
        var votes = 0, key;
        for (key in game_data.responses) {
            if (game_data.responses.hasOwnProperty(key)) votes += game_data.responses[key].votes;
        }

        return votes;
    };

    game_data.resetNewQuestion = function(){
        game_data.current_question++;
        game_data.responses = {};
    };

    return game_data;
});
