(function () {

    'use strict';

    angular.module('app').controller('authCtrl', [
      '$rootScope', '$state', 'UserService', 'ModalsService',
      function ($rootScope, $state, UserService, ModalsService) {
        var t = this;

        t.form = {};
        t.errors = [];

        function signIn () {
          UserService.signIn({
            username: t.form.username,
            password: t.form.password
          }).then(function (data) {
            $state.go('home');
          }, function (err) {
            t.errors = err.data;
          }).finally(function () {
            t.isLoading = false;
          });
        }

        t.signIn = function () {
          t.isLoading = true;
          t.errors = [];

          // clear cordova cookies before sign in. workaround for drupal cookie/token mismatch
          if (window && window.cookies && window.cookies.clear) {
            window.cookies.clear(signIn);
          } else {
            signIn();
          }
        };

        t.initiateForgotPassword = function (evt) {
          var modal = ModalsService.getModal();

          modal.open(evt, {
            templateUrl: 'modals/forgot-password.html',
            size: 'sm',
            backdrop: 'static'
          }, {}).result.then(function(result){
            if(result.action == 'cancel') {
              modal.close();
            }
            if(result.action == 'submit') {
              UserService.requestNewPassword(result.email).then(function(data) {
                if(data && data[0] === true) {
                  t.resetRequestSent = true;
                }
              }).catch(function(err){
                console.log(err);
              });
            }
          }, function(err) {
            //do nothing
          });
        }
      }
    ]);

}());
