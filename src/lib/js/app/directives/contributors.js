app.directive('contributors', [
  function() {
    return {
      scope: {
        authors: '=',
        illustrators: '='
      },
    restrict: 'A',
      template: '<span ng-bind-html="contribCtrl.text"></span>',
      controller: [
        '$scope',
        function ($scope) {
          var t = this;
          var writtenBy = 'Written by ';
          var authors = '';
          var illustratedBy = 'Illustrated by ';
          var illustrators = '';


          var samePerson = $scope.authors.length == 1 && $scope.illustrators.length == 1
                        && $scope.authors[0] == $scope.illustrators[0];

          function listItems(items) {
            var _items = items.concat();
            var lastItem;
            var str = '';

            if(_items.length > 1) {
             lastItem = _items.pop();
            }

            str = _items.join(', ') + (lastItem ? ' and ' + lastItem : '');
            return str;
          }

          t.text = '';
          if (samePerson) {
            t.text += 'Written and Illustrated by ' + $scope.authors[0];
          } else {
            if($scope.authors.length) {
              t.text += writtenBy + listItems($scope.authors) + ($scope.illustrators.length ? ' and ' : '');
            }
            if($scope.illustrators.length) {
              t.text += illustratedBy + listItems($scope.illustrators);
            }

          }
        }
      ],
      controllerAs: 'contribCtrl'
    };
  }
]);