app.filter('voteRemove', ['$gameData', function($gameData) {
  return function(items, value) {
    var filtered = [];
    angular.forEach(items, function(item) {
        if (item.id != $gameData.player.id) {
            filtered.push(item);
        }
    });
    return filtered;
  };
}]);
