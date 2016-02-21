'use strict';

app.directive('progressBar', function() {
    return {
        templateUrl: 'html/progress-bar.html',
        restrict: 'AE',
        scope: {
            "progress" : "="
        },
        controller: ['$scope', function($scope) {
            $scope.$watch('progress', function(){
                if ($scope.progress > 100) {
                    $scope.progress = 100;
                }

                if ($scope.progress < 0) {
                    $scope.progress = 0;
                }
            });

            $scope.barstyle = function() {
                return {
                    width: $scope.progress + '%',
                };
            };
        }],
        link: function(scope, element, attrs, tabsCtrl) {
            scope.setSelectedItem = function(progress) {
                  scope.progress = progress;
              };
        }
    };
});
