app.directive('appHeader', [
  function () {
    return {
      scope: {
        title: '=',
        type: '=', //navigation or logo
        headerClass: '='
      },
      restrict: 'E',
      templateUrl: 'templates/app-header.html',
      controller: [
        '$scope', '$rootScope',
        function ($scope, $rootScope) {
          var t = this;
        }
      ],
      controllerAs: 'appHeader'
    };
  }
]);