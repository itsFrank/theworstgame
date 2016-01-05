'use strict';

var app = angular.module('app', [
    'ngRoute',
    'ngMaterial'
]);

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/home', {
                templateUrl: 'html/home.html',
                controller: 'homeController'
            }).
            when('/create', {
                templateUrl: 'html/create-lobby.html',
                controller: 'createLobbyController'
            }).
            when('/join', {
                templateUrl: 'html/join-lobby.html',
                controller: 'joinLobbyController'
            }).
            when('/blank', {
                templateUrl: 'html/blank.html',
                controller: 'blankController'
            }).
            when('/lobby', {
                templateUrl: 'html/lobby.html',
                controller: 'lobbyController'
            }).
//::ROUTE_CURSOR_INDEX::
            otherwise({
                redirectTo: '/home'
            });
}]);

app.config(['$mdThemingProvider', function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
    .dark()
    .primaryPalette('amber')
    .accentPalette('green');
}]);
