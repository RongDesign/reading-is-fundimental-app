app.service('AppData', [
  '$rootScope',
  'CONFIG',
  '$resource',
  '$q',
  '$timeout',
  function($rootScope, CONFIG, $resource, $q, $timeout){
    var t = this;
    var user = {};
    var book_cache = [];
    var support_materials_cache = [];

    function findBookInCache(isbn) {
      var book = book_cache.filter(function(item){ return item.field_isbn == isbn; })[0];
      return book || null;
    }


    function findSupportMaterialsInCache(book_id) {
      var support_material = support_materials_cache.filter(function(item){ return item.field_related_books.some(function(item){ return item == book_id}); });
      return support_material || null;
    }

    /* Retrieves a book either from cache array or */
    this.fetchBook = function (isbn) {
      var defer, res;

      defer = $q.defer();

      /* look up book in cache first */
      var book = findBookInCache(isbn);
      if(book) {
        $timeout(function() {
          defer.resolve(book);
        }, 0);
        return defer.promise;
      }

      /* If book not previously looked up. */
      res = $resource(CONFIG.apiBaseUrl + '/book',
        {
          isbn: isbn
        }).query();

      res.$promise.then(function(result) {
        if(result[0]) {
          book_cache.push(result[0]);
        }

        defer.resolve(result[0]);
      }).catch(function(error) {
        defer.reject(error);
      }).finally(function(){
        $rootScope.$emit('processingFinished');
      });


      $rootScope.$emit('processingStart');
      return defer.promise;
    }

    // used to be able to get filtered data from a specific entity node
    this.fetchEntityData = function (nid, fields) {
      var res = $resource(CONFIG.apiBaseUrl + '/entity_node/:nid', { nid: nid, fields: fields.join(',') });
      return res.get().$promise;
    }

    this.fetchRelatedBooks = function(isbn) {
      var book = findBookInCache(isbn);
      var defer;

      if(book.related_books) {
        defer = $q.defer();
        $timeout(function() {
          defer.resolve(book.related_books);
        }, 0);

        return defer.promise;
      }

      if(book) {
        res = $resource(CONFIG.apiBaseUrl + '/book',
          {
            keywords: book.field_keywords.join(','),
            genres: book.field_genres.join(','),
            themes: book.field_themes.join(','),
          }).query();

        res.$promise.then(function(data){
          book.related_books = data;
        });

        return res.$promise;
      }

    }

    this.fetchSupportMaterials = function(book_id) {
      var defer;
      var supportMaterials = findSupportMaterialsInCache(book_id);

      if(supportMaterials.length) {
        defer = $q.defer();
        $timeout(function() {
          defer.resolve(supportMaterials);
        }, 0);

        return defer.promise;
      }

      var res;
      res = $resource(CONFIG.apiBaseUrl + '/support-material', {
        book_id: book_id
      }).query();

      res.$promise.then(function(data) {
        support_materials_cache = support_materials_cache.concat(data);
      }).catch(function(error) {

      });

      return res.$promise;
    }

    this.fetchLiteracyStandards = function(nid) {
      var res;
      res = $resource(CONFIG.apiBaseUrl + '/literacy-standards', {
        nid: nid
      }).query();

      return res.$promise;
    }

    this.fetchSupportMaterial = function(nid) {
      var defer = $q.defer();
      var supportMaterial = support_materials_cache.filter(function(item) {return item.nid == nid});

      if(supportMaterial.length) {
        $timeout(function() {
          defer.resolve(supportMaterial[0]);
        }, 0);

        return defer.promise;
      }

      var res;
      res = $resource(CONFIG.apiBaseUrl + '/support-material', {
        sm_id: nid
      }).query();

      res.$promise.then(function(data) {
        defer.resolve(data[0]);
      }).catch(function(error) {
        defer.reject(error);
      }).finally(function(){
        $rootScope.$emit('processingFinished');
      });

      $rootScope.$emit('processingStart');
      return defer.promise;

    }

    this.fetchSuggestions = function() {
      var res;
      res = $resource(CONFIG.apiBaseUrl + '/suggestions').query();

      res.$promise.then(function(result) {

      });

      return res.$promise;
    }

    this.fetchLuckyISBN = function() {
      var res = $resource(CONFIG.apiBaseUrl + '/lucky').query();
      return res.$promise;
    }
  }
]);
