'use strict';

app.controller('createLobbyController', function($scope, $socket, $mdDialog, $location){
    $socket.init();

    $scope.loading = false;
    $scope.name = '';
    $scope.cap = 5;

    $scope.create = function(ev) {
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

        if (!/^\d+$/.test($scope.cap) || $scope.cap < 1) {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Name Error')
                    .textContent('The player cap must be a number and larger than 1')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Ok')
                    .targetEvent(ev)
            );
            return;
        }

        $scope.loading = true;

        $socket.createLobby($scope.name, $scope.cap);

    };
});
