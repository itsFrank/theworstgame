'use strict';

app.controller('homeController', function($scope, $socket, $location){

    $scope.message = 'none';

    $scope.join = function(){
        $location.path('/join');
    };

    $scope.create = function(){
        $location.path('/create');
    };

});
