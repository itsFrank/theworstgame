'use strict';

app.directive('blank', function() {
    return {
        templateUrl: 'html/blank.html',
        restrict: 'AE',
        scope: {},
        controller: ['$scope', function($scope) {

        }],
        link: function(scope, element, attrs, tabsCtrl) {

        }
    };
})
