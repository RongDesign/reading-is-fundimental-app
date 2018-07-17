app.service('FavoritesService', [
  '$rootScope', '$q', '$filter', '$resource', 'CONFIG', 'UserService',
  function ($rootScope, $q, $filter, $resource, CONFIG, UserService) {

    this.getFoldersList = function () {

      var user = UserService.getUser();

      if(!user) { return null }

      var res = $resource(CONFIG.apiBaseUrl + '/favorites', null,
        {
          query: { method: 'GET', isArray: true, withCredentials:true, headers: { 'x-csrf-token': user.token } }
        });

      return res.query().$promise;

    }

    this.getFolderName = function (nid) {
      var user = UserService.getUser();
      var res = $resource(CONFIG.apiBaseUrl + '/entity_node/:folder', null, {
          get: {method: 'GET', withCredentials:true, headers: { 'x-csrf-token': user.token }}
      });

      var promise = res.get({folder: nid, fields: 'title'}).$promise;

      return promise;
    }

    this.getFolderContents = function (nid) {
      var user = UserService.getUser();
      var res = $resource(CONFIG.apiBaseUrl + '/resource', null, {
          query: {method: 'GET', isArray: true, withCredentials:true, headers: { 'x-csrf-token': user.token }}
      });

      var promise = res.query({folder: nid}).$promise;

      return promise;
    }

    this.createFolder = function (folder_name) {
      var user = UserService.getUser();
      var res = $resource(CONFIG.apiBaseUrl + '/node', null,
          {
              save: {method: 'POST', withCredentials:true, headers: { 'x-csrf-token': user.token } }
          });
      var promise = res.save({
          title: folder_name,
          type: "favoritesfolder"
      }).$promise;

      return promise;
    }

    this.renameFolder = function (nid, folder_name) {
      var user = UserService.getUser();
      var res = $resource(CONFIG.apiBaseUrl + '/node/:nid', null,
          {
              update: {method: 'PUT', withCredentials:true, headers: { 'x-csrf-token': user.token } }
          });

      var promise = res.update({
          nid: nid
      },{
          title: folder_name
      }).$promise;

      return promise;
    }

    this.deleteFolder = function (nid) {
      var user = UserService.getUser();
      var res = $resource(CONFIG.apiBaseUrl + '/node/:nid', null,
          {
              delete: {method: 'DELETE', isArray:true, withCredentials:true, headers: { 'x-csrf-token': user.token } }
          });

      var promise = res.delete({
          nid: nid
      }).$promise;

      return promise;
    }


    this.addFavorites = function (favArr, folder_nid) {
      var user = UserService.getUser();
      var target_ids = [];
      var defer = $q.defer();
      var t = this;

      t.getFolderContents(folder_nid).then(function(data){
        var notEmpty = data.length && data.some(function (item) { return item.hasOwnProperty('target_id') });

        if(notEmpty) {
          target_ids = data.map(function (item){ return item.target_id});
        }

        angular.forEach(favArr, function(favObj) {
          if(target_ids.indexOf(favObj.nid) == -1){
            if(favObj.hasOwnProperty('relatedBook') &&  target_ids.indexOf(favObj.relatedBook) == -1){
              target_ids.push(favObj.relatedBook);
            }

            target_ids.push(favObj.nid);
          }
        });

        t.syncFavoritesFolder(folder_nid, target_ids)
          .then(function (data) {
            defer.resolve(data);
          })
          .catch(function(err) {
            defer.reject(err);
          });
      });

      return defer.promise;
    }

    this.removeFavorite = function (favObj, folder_nid) {
      var user = UserService.getUser();
      var defer = $q.defer();
      var t = this;
      var removingBook = favObj.type == "Book Resource";
      var target_ids = [];

      t.getFolderContents(folder_nid).then(function(data) {

        target_ids = data
          .filter(function (item) {
            var sameItem = item.target_id == favObj.nid;
            var isRelatedToBook = removingBook && item.field_related_books.length && item.field_related_books.indexOf(favObj.nid) != -1;
            return !sameItem && !isRelatedToBook;
          })
          .map(function(item) {
            return item.target_id;
          });

        t.syncFavoritesFolder(folder_nid, target_ids)
          .then(function (data) {
            t.getFolderContents(folder_nid).then(function(data) {
              defer.resolve(data);
            });
          })
          .catch(function(err) {
            defer.reject(err);
          });
      });

      return defer.promise;
    }

    this.syncFavoritesFolder = function (folder_nid, target_ids) {
      var user = UserService.getUser();
      var res = $resource(CONFIG.apiBaseUrl + '/entity_node/:nid', null,
        {
            save: {method: 'PUT', withCredentials:true, headers: { 'x-csrf-token': user.token } }
        });

      var promise = res.save({
        nid: folder_nid
      },{
        uid: user.id,
        nid: folder_nid,
        type:'favoritesfolder',
        field_favorite_resources: {
          und: target_ids.map(function (item){ return { target_id: item }})
        }
      }).$promise;

      return promise;
    }
  }
]);