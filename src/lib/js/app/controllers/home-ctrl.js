(function () {

    'use strict';

    angular.module('app').controller('homeCtrl', [
      'UserService',
      function (UserService) {
        var t = this;

        t.user = UserService.getUser();
      }
    ]);

}());
