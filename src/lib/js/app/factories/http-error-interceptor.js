app.factory('httpErrorInterceptor', [
  '$q', '$rootScope',
  function ($q, $rootScope) {
    return {
      'requestError': function(rejection) {
        return $q.reject(rejection);
      },
      'responseError': function(rejection) {
        var msg = '';
        switch(rejection.status) {
          case 404:
            msg = 'An error has occurred. Please try again later.';
          break;
          case 500:
          case 0:
            msg = 'An error has occured while communicating to Literacy Central. Please try again later.';
          break;
          case -1:
          msg = "A communication error has occured. Please make sure you are connected to the internet and try again."
          break;
        }

        if(msg) {
          $rootScope.$emit('showGenericError', {msg: msg});
        }
        return $q.reject(rejection);

      }
    }
  }
]);