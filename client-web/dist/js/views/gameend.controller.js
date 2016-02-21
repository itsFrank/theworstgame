'use strict';

app.controller('gameendController', function($scope, $socket, $gameData, playerOrderFilter, $location, $timeout){
    if(!$socket.connected) $location.path('/');
    if($gameData.lobby === null) $location.path('/');

    $scope.lobby = $gameData.lobby;
    $scope.thisPlayer = $gameData.player;
    $gameData.currentScope = $scope;

    $scope.getBestScore = function(){
        var max = 0;
        for (var key in $scope.lobby.players) {
            if (!$scope.lobby.players.hasOwnProperty(key)) continue;

            var player = $scope.lobby.players[key];
            if (player.score > max) {
                max = player.score;
            }
        }

        for (key in $scope.lobby.players) {
            if (!$scope.lobby.players.hasOwnProperty(key)) continue;
            var player2 = $scope.lobby.players[key];

            if (player2.score == max) {
                player2.wins += 1;
            }
        }

        return max;
    };
    $scope.bestScore = $scope.getBestScore();

    $scope.hasBestScore = function(score){
        return (score == $scope.bestScore);
    };

    $scope.returnToLobby = function(){
        for (var key in $scope.lobby.players) {
            if (!$scope.lobby.players.hasOwnProperty(key)) continue;
            $scope.lobby.players[key].score = 0;
        }

        $location.path('/lobby');
    };

});
