(function () {

    'use strict';

    angular.module('app').controller('isbnFormCtrl', [
      '$scope', '$rootScope', '$state', 'AppData',
      function ($scope, $rootScope, $state, AppData) {
        var t = this;
        t.onSubmit = function ($event) {
          $event.preventDefault();
          $state.go('results', {isbn:t.isbn});
        }
      }
    ]);

}());
