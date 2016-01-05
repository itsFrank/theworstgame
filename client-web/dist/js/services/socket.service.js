app.factory('$socket', function($gameData, $location, $mdDialog){
    var socket_obj = {
        id : null,
        socket : null,
        connected : false
    };

    socket_obj.init = function(){
        socket_obj.socket = io.connect(window.location.host);

        socket_obj.socket.on("connectConfirm", socket_obj.connectConfirm);
        socket_obj.socket.on("playerJoined", socket_obj.playerJoined);
        socket_obj.socket.on("removePlayer", socket_obj.removePlayer);
    };

    /// RESPONSE FUNCTIONS ///
    socket_obj.connectConfirm = function(message){
        socket_obj.connected = true;
        socket_obj.id = message.data.id;
        console.log('confirmed');
        console.log(message);
    };

    socket_obj.playerJoined = function(message){
        console.log('player joined');
        $gameData.addPlayer(message.data);

        console.log($gameData.lobby);
    };

    socket_obj.removePlayer = function(message){
        console.log('Removing');
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


    /// EMIT FUNCTIONS ///
    socket_obj.createLobby = function(name, finish){
        console.log(name);
        if (!socket_obj.connected) return;
        console.log('emitting');

        socket_obj.socket.emit('createLobby', {
            id : socket_obj.id,
            name : name
        });

        console.log('emmitted');

        socket_obj.socket.on("lobbyCreated", function(message){
            console.log(message);
            $gameData.player = message.data.player;
            $gameData.lobby = message.data.lobby;
            finish();
        });

    };

    socket_obj.joinLobby = function(code, name, finish){
        if (!socket_obj.connected) return;

        console.log("code: " + code);
        console.log("name: " + name);

        console.log('emiting');
        socket_obj.socket.emit("joinLobby", {
                id : socket_obj.id,
                name : name,
                code : code
        });

        console.log('emited');
        socket_obj.socket.on("lobbyJoined", function(message){
            console.log(message);
            if (message.err) {
                finish(false);
                return;
            }

            $gameData.player = message.data.player;
            $gameData.lobby = message.data.lobby;
            finish(true);
        });
    };

    socket_obj.kickPlayer = function(player){
        console.log(player);
        socket_obj.socket.emit('kickPlayer', {
            host : $gameData.player,
            player : player
        });
    };

    return socket_obj;
});
