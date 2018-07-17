app.service('GTMService', [
  '$rootScope', 'UserService',
  function ($rootScope, UserService) {

    this.trackPageView = function(page, data) {
      var user = UserService.getUser();
      var dl = angular.extend({}, data, {
        event: 'rifPageView',
        page: page,
        uid: user && user.id || null
      });

      dataLayer.push(dl);
    }

    this.trackPDF = function (data) {
      var user = UserService.getUser();
      var dl = angular.extend({}, data, {
        event: 'rifPDF',
        uid: user && user.id || null
      });

      dataLayer.push(dl);
    }

    this.trackAddFavorite = function (data) {
      var user = UserService.getUser();
      var dl = angular.extend({}, data, {
        event: 'rifAddFavorite',
        uid: user && user.id || null
      });

      dataLayer.push(dl);
    }

    this.trackFavoriteAll = function (data) {
      var user = UserService.getUser();
      var dl = angular.extend({}, data, {
        event: 'rifFavoriteAll',
        uid: user && user.id || null
      });

      dataLayer.push(dl)
    }

    this.trackExternalLink = function (data) {
      var user = UserService.getUser();
      var dl = angular.extend({}, data, {
        event: 'rifExternalLink',
        uid: user && user.id || null
      });

      dataLayer.push(dl)
    }
  }
]);