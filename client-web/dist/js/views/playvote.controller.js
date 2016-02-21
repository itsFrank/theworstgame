'use strict';

app.controller('playvoteController', function($scope, $socket, $gameData, $location, $timeout, voteRemoveFilter){
    if(!$socket.connected) $location.path('/');
    if($gameData.lobby === null) $location.path('/');

    $scope.lobby = $gameData.lobby;
    $scope.thisPlayer = $gameData.player;
    $gameData.currentScope = $scope;

    $scope.maxtime = 30;
    $scope.timer = $scope.maxtime;
    $scope.progress = 100;

    $scope.question = $gameData.questions[$gameData.current_question];

    $scope.selectedResponse = null;
    $scope.voted = false;

    $scope.responses = $gameData.responses;

    $scope.timerUpdate = function(){
        if ($scope.timer <= 0) {
            $timeout(function(){
                console.log("path to playresult from playvote");
                $scope.cancel_timer('/playresult');
            }, 1000);
            if (!$scope.voted && $scope.selectedResponse !== null) {
                $socket.sendVote($scope.selectedResponse);
                $scope.voted = true;
            }
        } else {
            $scope.timer -= 0.01;
            $scope.progress = ($scope.timer / $scope.maxtime) * 100;
            $scope.vote_timer_promise = $timeout($scope.timerUpdate, 10);
        }
    };
    $scope.timerUpdate();

    $scope.$on('$locationChangeStart', function(){
        $timeout.cancel($scope.vote_timer_promise);
    });

    $scope.cancel_timer = function(path){
        $location.path(path);
        if(!$scope.$$phase) $scope.$apply();
    };

    $scope.selectResponse = function(id) {
        if($scope.voted) return;
        $scope.selectedResponse = id;
    };

    $scope.vote = function(){
        $scope.voted = true;
        $socket.sendVote($scope.selectedResponse);
    };

    $scope.buttonEnabled = function(){
        return (($scope.selectedResponse === null) || $scope.voted);
    };

    $scope.submit_count = function(){
        return $gameData.numVotes() + "/" + $gameData.numPlayers();
    };
});
