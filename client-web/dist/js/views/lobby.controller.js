'use strict';

app.controller('lobbyController', function($scope, $socket, $gameData, playerOrderFilter, $location){
    if(!$socket.connected) $location.path('/');
    if($gameData.lobby === null) $location.path('/');

    $scope.lobby = $gameData.lobby;
    $scope.thisPlayer = $gameData.player;
    $gameData.currentScope = $scope;


    $scope.kickPlayer = function(player){
        console.log(player.name);
        if (!$scope.thisPlayer.ishost) return;

        $socket.kickPlayer(player);
    };
    // $scope.thisPlayer = {};
    // $scope.thisPlayer.ishost = true;
    // $scope.lobby = {};
    //
    // $scope.lobby.id = 'ABCDE';
    // $scope.lobby.players = {
    //     '1' : {name : 'Frank', wins : 3, ishost : true},
    //     '2' : {name : 'Amar', wins : 1},
    //     '3' : {name : 'Zak', wins : 4},
    //     '4' : {name : 'Eugenia', wins : 1},
    // };
});
