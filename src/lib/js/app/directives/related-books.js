app.directive('relatedBooks', [
  function() {
    return {
      restrict: 'AE',
      templateUrl: 'templates/related-books.html',
      scope: {
        isbn: "="
      },
      controller: [
        '$scope', '$stateParams', 'CONFIG', 'AppData',
        function($scope, $stateParams, CONFIG, AppData) {
          var t = this;

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

          AppData.fetchRelatedBooks($scope.isbn).then(function(data){
            t.books = data.map(function(item){
              return {
                image: CONFIG.bookCoverBaseUrl + item.field_book_cover_file_name.value,
                title: item.title,
                authors: listItems(item.field_author),
                isbn: item.field_isbn
              }
            });
          });

        }
      ],
      controllerAs: 'relatedBooksCtrl',
      link: function (scope, element, attrs) {

      }
    }
  }
]);