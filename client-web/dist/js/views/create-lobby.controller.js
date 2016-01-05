'use strict';

app.controller('createLobbyController', function($scope, $socket, $mdDialog, $location){
    $socket.init();

    $scope.loading = false;
    $scope.name = '';

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

        $scope.loading = true;

        $socket.createLobby($scope.name, function(){
            $scope.loading = false;
            $location.path('/lobby');
        });

    };
});
