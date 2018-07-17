app.filter('omit', function() {

  return function(obj, props) {
    var copy = angular.extend({}, obj);

    arr = Array.isArray(props) ? props : [props];
    arr.forEach(function(key){
      delete(copy[key]);
    });
    return copy;
  }
});