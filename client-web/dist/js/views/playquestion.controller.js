'use strict';

app.controller('playquestionController', function($scope, $socket, $gameData, $location, $timeout){
    if(!$socket.connected) $location.path('/');
    if($gameData.lobby === null) $location.path('/');

    $scope.lobby = $gameData.lobby;
    $scope.thisPlayer = $gameData.player;
    $gameData.currentScope = $scope;

    $scope.maxtime = 30;
    $scope.timer = $scope.maxtime;
    $scope.progress = 100;

    $scope.question = $gameData.questions[$gameData.current_question];
    $scope.response = '';
    $scope.res_sent = false;

    $scope.timerUpdate = function(){
        if ($scope.timer <= 0) {
            console.log("path to playvote from playquestion");
            $scope.cancel_timer('/playvote');
        } else {
            $scope.timer -= 0.01;
            $scope.progress = ($scope.timer / $scope.maxtime) * 100;
            $scope.question_timer_promise =  $timeout($scope.timerUpdate, 10);
        }
    };
    $scope.timerUpdate();

    $scope.$on('$locationChangeStart', function(){
        $timeout.cancel($scope.question_timer_promise);
    });

    $scope.cancel_timer = function(path){
        $location.path(path);
        if(!$scope.$$phase) $scope.$apply();
    };


    $scope.fixResponse = function(){
        if ($scope.response.length > 100) {
            $scope.response = $scope.response.substring(0, 100);
        }
    };

    $scope.sendResponse = function(){
        $socket.sendResponse($scope.response);
        $scope.res_sent = true;
    };

    $scope.submit_count = function(){
        return $gameData.numResponses() + "/" + $gameData.numPlayers();
    };
});
