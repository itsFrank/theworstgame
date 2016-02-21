app.factory('$socket', function($gameData, $location, $mdDialog, $rootScope){
    var socket_obj = {
        id : null,
        socket : null,
        connected : false
    };

    socket_obj.init = function(){
        socket_obj.socket = io.connect(window.location.host);

        socket_obj.socket.on("connectConfirm", socket_obj.connectConfirm);
        socket_obj.socket.on("playerJoined", socket_obj.playerJoined);
        socket_obj.socket.on("playerLeft", socket_obj.playerLeft);
        socket_obj.socket.on("removePlayer", socket_obj.removePlayer);
        socket_obj.socket.on("gameStarted", socket_obj.gameStarted);
        socket_obj.socket.on("newResponse", socket_obj.newResponse);
        socket_obj.socket.on("newVote", socket_obj.newVote);
        socket_obj.socket.on("newQuestion", socket_obj.newQuestion);
        socket_obj.socket.on("gameEnded", socket_obj.gameEnded);
    };

    /// RESPONSE FUNCTIONS ///
    socket_obj.connectConfirm = function(message){
        socket_obj.connected = true;
        socket_obj.id = message.data.id;
        console.log('confirmed connection');
    };

    socket_obj.playerJoined = function(message){
        console.log('player joined');
        $gameData.addPlayer(message.data);
    };

    socket_obj.playerLeft = function(message){
        console.log("player left");
        $gameData.removePlayer(message.data);
    };

    socket_obj.removePlayer = function(message){
        console.log('Removing player');
        if (message.data.id === $gameData.player.id) {
            $gameData.player = {};
            $gameData.lobby = {};
            $gameData.currentScope = {};

            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Kicked from game')
                    .textContent('You were kicked from the game by the host')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Ok')
            );
            socket_obj.socket.disconnect();
            socket_obj.id = null;
            socket_obj.socket = null;
            socket_obj.connected = false;
            $location.path('/');
        } else {
            $gameData.removePlayer(message.data);
        }
    };

    socket_obj.gameStarted = function(message) {
        console.log("Game started");
        $gameData.newGame(message.data.questions);
        $gameData.currentScope.startGame();
    };

    socket_obj.newResponse = function(message){
        console.log("recieved new response");
        $gameData.responses[message.data.id] = message.data;

        if ($gameData.numResponses() == $gameData.numPlayers()) {
            $gameData.currentScope.cancel_timer('/playvote');
        }
    };

    socket_obj.newVote = function(message){
        console.log("recieved new vote");
        $gameData.responses[message.data.vote].votes += 1;

        if ($gameData.numVotes() == $gameData.numPlayers()) {
            $gameData.currentScope.cancel_timer('/playresult');
        }
    };

    socket_obj.newQuestion = function(message){
        console.log("recieved launch for new question");
        $gameData.resetNewQuestion();
        $gameData.currentScope.cancel_timer('/playquestion');
    };

    socket_obj.gameEnded = function(message){
        console.log("recieved end game message");
        $gameData.currentScope.cancel_timer('/gameend');
    };

    /// EMIT FUNCTIONS ///
    socket_obj.createLobby = function(name, cap){
        if (!socket_obj.connected) return;
        console.log('Creating lobby');

        socket_obj.socket.emit('createLobby', {
            id : socket_obj.id,
            name : name,
            cap : cap
        });

        socket_obj.socket.on("lobbyCreated", function(message){
            console.log("Lobby created");
            $gameData.player = message.data.player;
            $gameData.lobby = message.data.lobby;
            $rootScope.$apply(function() {
                $location.path("/lobby");
            });
        });

    };

    socket_obj.joinLobby = function(code, name){
        if (!socket_obj.connected) return;

        console.log('joining lobby:' + code);
        socket_obj.socket.emit("joinLobby", {
                id : socket_obj.id,
                name : name,
                code : code
        });

        socket_obj.socket.on("lobbyJoined", function(message){
            console.log("lobbyJoined Recieved");
            if (message.err) {
                $gameData.currentScope.err_msg(message.errmsg);
                return;
            }

            $gameData.player = message.data.player;
            $gameData.lobby = message.data.lobby;
            $rootScope.$apply(function() {
                $location.path("/lobby");
            });
        });
    };

    socket_obj.kickPlayer = function(player){
        console.log("Kicking player" + player.name);
        socket_obj.socket.emit('kickPlayer', {
            host : $gameData.player,
            player : player
        });
    };

    socket_obj.startGame = function(num_q){
        console.log("Start game sent");
        socket_obj.socket.emit('startGame', {
            host : $gameData.player,
            num_questions : num_q
        });
    };

    socket_obj.sendResponse = function(response){
        console.log("sending response");
        socket_obj.socket.emit('sendResponse', {
            player : $gameData.player,
            response : response,
        });
    };

    socket_obj.sendVote = function(id){
        console.log("sending vote: " + id);
        socket_obj.socket.emit('sendVote', {
            player : $gameData.player,
            vote : id
        });
    };

    socket_obj.startNewQuestion = function(){
        console.log("starting new question");
        socket_obj.socket.emit('startNewQuestion', {
            player : $gameData.player,
        });
    };

    socket_obj.endGame = function(){
        console.log("ending current game");
        socket_obj.socket.emit('endGame', {
            player : $gameData.player,
        });
    };

    return socket_obj;
});
