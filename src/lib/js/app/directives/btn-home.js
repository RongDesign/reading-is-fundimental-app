app.directive('btnHome', [
  function () {
    return {
      scope: {
        btnClass: "@",
        gotoState: "@",
        icon: "@",
        label: "@"
      },
      replace: true,
      restrict: 'E',
      templateUrl: 'templates/btn-home.html',
      link: function (scope, element, attrs) {

      }
    }
  }
]);