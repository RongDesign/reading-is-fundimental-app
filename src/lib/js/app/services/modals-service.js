app.service('ModalsService', [
  '$modal',
  function ($modal) {
    var ModalInstanceCtrl = function ($scope, $modalInstance, args) {
      $scope.args = args;
      $scope.close = function (msg) {
        $modalInstance.close(msg);
      };
      $scope.dismiss = function (msg) {
        $modalInstance.dismiss(msg);
      };
    };
    ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'args'];

    function getModal () {
      var modal = {};
      var $handle;

      modal.open = function (evt, params, args) {

        var opts = angular.extend({}, params, {
          controller: ModalInstanceCtrl,
          resolve: {
            args: function () {
              return args;
            }
          }
        });

        $handle = $modal.open(opts);
        if (evt && evt.preventDefault) {
          evt.preventDefault();
        }
        return $handle;
      };

      modal.confirm = function (context, callback) {
        modal.open(null, 'modals/confirm/confirm.html', 'md', 'static', {
          context: context,
          onClose: callback
        });
      };

      modal.close = function () {
        $handle.close();
      };

      return modal;
    }

    return {
      getModal: getModal
    };
  }
]);