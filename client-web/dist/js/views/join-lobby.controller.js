'use strict';

app.controller('joinLobbyController', function($scope, $socket, $mdDialog, $gameData, $location){
    $socket.init();

    $scope.name = '';
    $scope.code = '';

    $scope.fixCode = function(){
            $scope.code = $scope.code.replace(/[^a-z]+/gi, '');
            $scope.code = $scope.code.replace(/\s/g, '');
            $scope.code = $scope.code.toUpperCase();
            if ($scope.code.length > 5) {
                $scope.code = $scope.code.substring(0, 5);
            }
    };

    $scope.fixName = function(){
        if ($scope.name.length > 30) {
            $scope.name = $scope.name.substring(0, 30);
        }
    };

    $scope.join = function(ev) {
        if (!$scope.code.match(/^[a-zA-Z]+$/)) {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Room Code Error')
                    .textContent('Room codes may only contain letters')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Ok')
                    .targetEvent(ev)
            );
            return;
        }

        if ($scope.code.length != 5) {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Room Code Error')
                    .textContent('Room must contain 5 letters')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Ok')
                    .targetEvent(ev)
            );
            return;
        }

        if (!$scope.name.match(/[a-z]/i)) {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Name Error')
                    .textContent('You must have at least one alphabetical character in your name')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Ok')
                    .targetEvent(ev)
            );
            return;
        }

        $scope.loading = true;

        $socket.joinLobby($scope.code, $scope.name, function(success){
            console.log($gameData.player);
            console.log($gameData.lobby);

            $scope.loading = false;



            if (success) $location.path('/lobby');
            else {
                $mdDialog.show(
                    $mdDialog.alert()
                        .parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title('Connection Error')
                        .textContent('Could not connect to game with code: \'' + $scope.code + '\'   verify that code is correct and try again')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('Ok')
                        .targetEvent(ev)
                );
            }
        });
    };
});
