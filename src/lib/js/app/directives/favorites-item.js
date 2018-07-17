app.directive('favoritesItem', [
  function() {
    return {
      restrict: 'A',
      templateUrl: 'templates/favorites-item.html',
      scope: {
        book: '=favoritesItem',
        supportMaterials: '='
      },
      controller: [
        '$scope', '$stateParams', 'FavoritesService',
        function($scope, $stateParams, FavoritesService) {
          var t = this;

          t.remove = function (favObj) {
            $scope.$emit('removeItem', {favObj:favObj});
          }

        }
      ],
      controllerAs: 'favoriteCtrl',
      link: function (scope, element, attrs) {
        var animating = false;
        scope.favoriteCtrl.toggleSupportMaterials = function () {
          if(animating) return;

          animating = true;

          $(element).find('.favorites-item').toggleClass('expanded');
          $(element).find('.collapse').slideToggle(400, function() {
            animating = false;
          });

        }
      }
    }
  }
]);