app.controller('modalAddFavoriteCtrl', [
  '$rootScope', '$scope', 'UserService', 'FavoritesService',
  function ($rootScope, $scope, UserService, FavoritesService) {
    var t = this;


    function uniqueList(arr) {
      return arr.filter(function(item, index, self) {
        return self.indexOf(item) == index;
      });
    }

    function materialIDs() {
      return $scope.args.materials.map(function (item) {
        return item.nid;
      });
    }

    $scope.processing = true;

    t.selectedFolder = 'new';

    FavoritesService.getFoldersList().then(function(data) {
      if(data) {

        //reverse array so that latest updated folder is shown first in the list.
        $scope.favoriteFolders = data.reverse().map(function(item) {
          return {
            nid: item.nid,
            resources: item.field_favorite_resources,
            title: item.title
          }
        });

        if($scope.favoriteFolders.length) {
          t.selectedFolder = $scope.favoriteFolders[0];
          t.checkResourcesLimit();
        }
        if($scope.favoriteFolders.length >= 10) {
          $scope.hideCreateNew = true;
        }
      }

      $scope.processing = false;

    });


    t.checkResourcesLimit = function () {
      t.limit_exceeded = false;

      if(t.selectedFolder != 'new') {
        t.limit_exceeded = uniqueList(t.selectedFolder.resources.concat(materialIDs())).length > 100;
      }
    }

    t.addTo = function (folder) {
      $scope.processing = true;

      if(folder == 'new') {
        FavoritesService.createFolder(t.newFolderName).then(function(data) {
          FavoritesService.addFavorites($scope.args.materials, data.nid).then(function(data) {
            $scope.close({success: true});
          }).catch(function(err){

          }).finally(function(){

          });

        }).catch(function(err){

        });
      } else {
        FavoritesService.addFavorites($scope.args.materials, folder.nid).then(function(data) {
          $scope.close({success: true});
        }).catch(function(err){
          console.log(err);
        }).finally(function(){

        });
      }
    }
  }
]);