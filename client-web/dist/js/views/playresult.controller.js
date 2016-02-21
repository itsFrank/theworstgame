'use strict';

app.controller('playresultController', function($scope, $socket, $gameData, $location, $timeout, resultOrderFilter){
    if(!$socket.connected) $location.path('/');
    if($gameData.lobby === null) $location.path('/');

    $scope.lobby = $gameData.lobby;
    $scope.thisPlayer = $gameData.player;
    $gameData.currentScope = $scope;

    $scope.maxtime = 5;
    $scope.timer = $scope.maxtime;
    $scope.progress = 100;

    $scope.question = $gameData.questions[$gameData.current_question];

    $scope.responses = $gameData.responses;

    /*
    {
        p1: {
            response : "something",
            name: "Frank",
            votes : 2
        },
        p2 : {
            response : "PQ6PGww3Wl3z CrKLGwp1u7BF48p KAXeQ7vLbkq H9J6uKHcLS6 GSN5U6WeEnWU 5YC5LbCv2 saTXgT8HM94 irmeiVH51M euz6UFd",
            name: 'Paul',
            votes: 2
        },
        p3 : {
            response : "A shitty response",
            name: 'Kevin',
            votes: 0
        }
    };//
     */

    $scope.timerUpdate = function(){
        if ($scope.timer <= 0) {
            $scope.declareWinner();
            if ($gameData.player.ishost) {
                console.log("Finished question: " + $gameData.current_question + 1 );
                if ($gameData.current_question + 1 == $gameData.questions.length) {
                    $socket.endGame();
                } else {
                    $socket.startNewQuestion();
                }
            }
        } else {
            $scope.timer -= 0.01;
            $scope.progress = ($scope.timer / $scope.maxtime) * 100;
            $scope.result_timer_promise = $timeout($scope.timerUpdate, 10);
        }
    };
    $scope.timerUpdate();

    $scope.$on('$locationChangeStart', function(){
        $timeout.cancel($scope.result_timer_promise);
    });

    $scope.cancel_timer = function(path){
        $location.path(path);
        if(!$scope.$$phase) $scope.$apply();
    };


    $scope.getMostVotes = function(){
        var max = 0;
        for (var key in $scope.responses) {
            if (!$scope.responses.hasOwnProperty(key)) continue;

            var res = $scope.responses[key];
            if (res.votes > max) {
                max = res.votes;
            }
        }
        return max;
    };

    $scope.hasMostVotes = function(votes){
        return (votes == $scope.mostVotes);
    };

    $scope.declareWinner = function(){
        for (var key in $scope.responses) {
            if (!$scope.responses.hasOwnProperty(key)) continue;

            var res = $scope.responses[key];
            if (res.votes == $scope.mostVotes) {
                $gameData.lobby.players[res.id].score += 1;
            }
        }
    };

    $scope.mostVotes = $scope.getMostVotes();
});
