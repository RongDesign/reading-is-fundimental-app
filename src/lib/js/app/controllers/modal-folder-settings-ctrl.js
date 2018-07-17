app.controller('modalFolderSettinsCtrl', [
  '$rootScope', '$scope', 'UserService', 'FavoritesService',
  function ($rootScope, $scope, UserService, FavoritesService) {
    var t = this;

    t.folder = angular.copy($scope.args.folder);

    t.rename = function () {
      FavoritesService.renameFolder(t.folder.nid, t.folder.title).then(function (data) {
        $scope.close({success:true});
      }).catch(function(err) {

      });
    }

    t.delete = function() {
      FavoritesService.deleteFolder(t.folder.nid).then(function(data){
        $scope.close({success:true});
      }).catch(function(err){
        $scope.dismiss();
      });
    }
  }
]);