app.filter('relatedBookId', function() {

  return function(input, id) {
    var output = input.filter(function(item) {
      return item.related_books && item.related_books.indexOf(id.toString()) != -1;
    });
    return output;
  }
});