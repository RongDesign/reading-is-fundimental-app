app.controller('scanCtrl', [
  '$state', '$scope', 'CONFIG', 'AppData', 'GTMService',
  function ($state, $scope, CONFIG, AppData, GTMService) {
    var t = this;

    t.websiteUrl = CONFIG.siteBaseUrl;

    // Grab random ISBN to use with I'm feeling lucky link.
    AppData.fetchLuckyISBN().then(function(data){
      t.luckyIsbn = data[0].field_isbn;
    });


    t.launchWebsite = function(e) {
      var a = e.target;

      GTMService.trackExternalLink({
        url: a.href
      });

      if (!a) {
        return;
      }

      if (window.cordova && window.cordova.InAppBrowser && window.cordova.InAppBrowser.open) {
        window.cordova.InAppBrowser.open(a.href, a.target, 'location=no');
        e.preventDefault();
      }
    };

    function onDetected (isbn) {
      $state.go('results', { isbn: isbn });
    }

    function onError (err) {
      t.detectedResults = {
        error: true
      };
    }

    t.scan = function () {
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.barcodeScanner && window.cordova.plugins.barcodeScanner.scan) {
        window.cordova.plugins.barcodeScanner.scan(function (result) {
          if (result.text) {
            onDetected(result.text);
          }
        }, function (error) {
          $scope.$apply(function () {
            onError(error);
          });
        }, {
          disableAnimations : true,
          disableSuccessBeep: false,
          formats : 'EAN_8,EAN_13',
          orientation : 'landscape',
          preferFrontCamera : false,
          prompt : 'Place a barcode inside the scan area',
          resultDisplayDuration: 0,
          saveHistory: false,
          showFlipCameraButton : false,
          showTorchButton : false,
          torchOn: false
        });
      } else {
        onError();
      }
    };
  }
]);
