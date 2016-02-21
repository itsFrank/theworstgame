'use strict';

app.controller('lobbyController', function($scope, $socket, $gameData, playerOrderFilter, $location, $timeout){
    if(!$socket.connected) $location.path('/');
    if($gameData.lobby === null) $location.path('/');

    $scope.lobby = $gameData.lobby;
    $scope.thisPlayer = $gameData.player;
    $gameData.currentScope = $scope;

    $scope.num_questions = 5;

    $scope.starting = false;
    $scope.countdown_time = 5;

    $scope.kickPlayer = function(player){
        if (!$scope.thisPlayer.ishost) return;
        $socket.kickPlayer(player);
    };

    $scope.sendStart = function(){

        $socket.startGame($scope.num_questions);
    };

    $scope.startGame = function(){
        $scope.starting = true;
        $scope.countdown_time = 2;
        $timeout($scope.countdown, 500);
    };

    $scope.countdown = function(){
        if ($scope.countdown_time === 1) {
            $location.path('/playquestion');
        } else {
            $scope.countdown_time -= 1;
            $timeout($scope.countdown, 1000);
        }
    };
});
