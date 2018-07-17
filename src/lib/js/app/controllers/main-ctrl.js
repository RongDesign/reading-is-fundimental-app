(function () {

    'use strict';

    angular.module('app').controller('mainCtrl', [
      '$scope', '$rootScope', '$state', '$window', '$filter', 'CONFIG', 'GTMService', 'ModalsService', 'UserService',
      function ($scope, $rootScope, $state, $window, $filter, CONFIG, GTMService, ModalsService, UserService) {
        var t = this;


        function showMessage(evt, msg) {
          var modal = ModalsService.getModal();
          var result = modal.open(evt, {
            templateUrl: 'modals/message.html',
            size: 'sm',
            backdrop: 'static'
          }, {
            message: msg
          }).result;
          result.then(function(result) {

          }, function(err) {
            //do nothing
          });

          return result;
        }

        $rootScope.$on('showGenericError', function(evt, data) {
          showMessage(evt, data.msg);
        });

        $rootScope.$on('$stateChangeStart', function(evt, toState, toParam, fromState, fromParams) {
          if (toState.name === 'register') {
            if (window.cordova && window.cordova.InAppBrowser && window.cordova.InAppBrowser.open) {
              window.cordova.InAppBrowser.open(CONFIG.siteRegisterUrl, '_system', 'location=no');
              evt.preventDefault();
            }
          }

          if (toState.name == 'sign-out') {
            t.processing = true;
            UserService.signOut().then(function () {
              $state.go('home', null, {reload: true});
            }, function (err) {
              $state.go('home', null, {reload: true});
            }).finally(function(){
              t.processing = false;
            });
            evt.preventDefault();
          }
        });

        $rootScope.$on('$stateChangeSuccess', function(evt, toState, toParam, fromState, fromParams) {
          /* scroll every page back to top on load */
          $window.scrollTo(0, 0);

          function annotatedStateObject(state, $current) {
              state = angular.extend({}, state);
              var resolveData = $current.locals.resolve.$$values;
              state.params = resolveData.$stateParams;
              state.resolve = $filter('omit')(resolveData, '$stateParams');
              state.includes = $current.includes;
              return state;
          }

          var state = annotatedStateObject(toState, $state.$current);
          var dl_obj = {};

          t.hideNav = toState.data && toState.data.hideNav || false;
          t.hideHeader = toState.data && toState.data.hideHeader || false;
          t.hideFooter = toState.data && toState.data.hideFooter || false;
          t.title = toState.data && toState.data.title;

          t.headerType = toState.data && toState.data.headerType;
          t.headerClass = toState.data && toState.data.headerClass;


          // Google Tag Manager Tracking

          switch(state.name) {
            case 'book':
              dl_obj.nid = state.resolve.bookResult && state.resolve.bookResult.nid || null;
              dl_obj.isbn = state.params.isbn;
              dl_obj.title = state.resolve.bookResult && state.resolve.bookResult.title || null;
              break;
            case 'results':
              dl_obj.nid = state.resolve.bookResult && state.resolve.bookResult.nid || null;
              dl_obj.isbn = state.params.isbn;
              dl_obj.title = state.resolve.bookResult && state.resolve.bookResult.title || null;
              dl_obj.found = !!dl_obj.nid;
              break;
            case 'support-material':
              dl_obj.nid = state.params.nid;
              dl_obj.title = state.resolve.supportMaterialResult && state.resolve.supportMaterialResult.title || null;
              break;
          }
          GTMService.trackPageView(state.name, dl_obj);

        });

        $rootScope.$on('processingFinished', function(evt) {
          t.processing = false;
        });

        $rootScope.$on('processingStart', function(evt) {
          t.processing = true;
        });

        t.processing = false;
      }
    ]);

}());
