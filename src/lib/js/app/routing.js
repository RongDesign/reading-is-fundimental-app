app.config([
  '$stateProvider', '$urlRouterProvider', 'CONFIG',
  function ($stateProvider, $urlRouterProvider, CONFIG) {
    $urlRouterProvider.otherwise('/');

    $stateProvider.state('landing', {
      url: '/',
      templateUrl: 'views/landing.html',
      data: {
        hideFooter: true,
        headerType: 'logo',
        headerClass: ['logo-header', 'no-background']
      }
    });

    $stateProvider.state('sign-in', {
      url: '/sign-in',
      templateUrl: 'views/sign-in.html',
      data: {
        headerType: 'logo',
        headerClass: ['logo-header']
      },
      controller: 'authCtrl',
      controllerAs: 'auth'
    });

    $stateProvider.state('sign-out', {
      url: '/sign-out',
      templateUrl: 'views/sign-out.html',
      controller:[
        '$state', 'UserService',
        function($state, UserService) {
          UserService.signOut().then(function () {
            $state.go('home');
          }, function () {
            $state.go('home');
          });
        }
      ]
    });

    $stateProvider.state('register', {
      url: '/register',
      templateUrl: 'views/register.html',
      data: {
        headerType: 'logo',
        headerClass: ['logo-header']
      },
      controller: 'registerCtrl',
      controllerAs: 'registration'
    });

    $stateProvider.state('home', {
      url: '/home',
      templateUrl: 'views/home.html',
      data: {
        hideFooter: true,
        headerType: 'logo',
        headerClass: ['logo-header', 'no-background']
      },
      controller: 'homeCtrl',
      controllerAs: 'home'
    });

    $stateProvider.state('scan', {
      url: '/scan',
      templateUrl: 'views/scan.html',
      data: {
        title: 'Scan Book'
      },
      controller: 'scanCtrl',
      controllerAs: 'scan'
    });

    $stateProvider.state('enter-isbn', {
      url: '/enter-isbn',
      templateUrl: 'views/enter-isbn.html',
      data: {
        title: 'Enter ISBN'
      }
    });

    $stateProvider.state('results', {
      url: '/results/:isbn',
      templateUrl: 'views/results.html',
      data: {
        title: 'Scan Results'
      },
      controller:[
        '$stateParams','bookResult','CONFIG', 'AppData', 'GTMService',
        function($stateParams, bookResult, CONFIG, AppData, GTMService) {

          var t = this;
          if (!bookResult) {

            AppData.fetchSuggestions().then(function(data){
              t.suggestions = data.map(function(item){
                return {
                  image: CONFIG.bookCoverBaseUrl + item.field_book_cover_file_name.value,
                  title: item.title,
                  isbn: item.field_isbn,
                  authors: item.field_author,
                  illustrators: item.field_illustrator
                }
              });
            });
          }else {
            t.book = {
              authors: bookResult.field_author,
              illustrators: bookResult.field_illustrator,
              image: CONFIG.bookCoverBaseUrl + bookResult.field_book_cover_file_name.value,
              isbn: bookResult.field_isbn,
              lexile: bookResult.field_lexile || 'N/A',
              title: bookResult.title
            };
          }

        }
      ],
      controllerAs: 'results',
      resolve: {
        bookResult: [
          '$stateParams',
          'AppData',
          function($stateParams, AppData) {
            if($stateParams.isbn) {
              return AppData.fetchBook($stateParams.isbn);
            }else {
              return null;
            }
          }
        ]
      }
    });

    $stateProvider.state('book', {
      url: '/book/:isbn',
      templateUrl: 'views/book.html',
      data: {
        title: 'Book'
      },
      controller:[
        '$stateParams','bookResult', 'CONFIG', 'AppData', 'ModalsService', 'GTMService', 'UserService',
        function($stateParams, bookResult, CONFIG, AppData, ModalsService, GTMService, UserService) {
          var t = this;

          if (!bookResult) {
            return;
          }

          t.favoritesAdded = [];
          t.book = {
            nid: bookResult.nid,
            ageRange: bookResult.field_age_range_min.value + (bookResult.field_age_range_max.value ? ' - ' + bookResult.field_age_range_max.value : '') + ' Years',
            authors: bookResult.field_author,
            copyrightYear: bookResult.field_copyright_year.substring(0,4),
            description: bookResult.field_description,
            illustrators: bookResult.field_illustrator,
            genres: bookResult.field_genres.join(', '),
            gradeLevel: bookResult.field_grade_level_min + (bookResult.field_grade_level_max && bookResult.field_grade_level_min != bookResult.field_grade_level_max ? ' - ' + bookResult.field_grade_level_max : ''),
            image: CONFIG.bookCoverBaseUrl + bookResult.field_book_cover_file_name.value,
            isbn: bookResult.field_isbn,
            lexile: bookResult.field_lexile,
            pageCount: bookResult.field_page_count,
            publisher: bookResult.field_publisher,
            themes: bookResult.field_themes.join(', '),
            title: bookResult.title,
            type: 'book'
          };

          AppData.fetchSupportMaterials(bookResult.nid).then(function(data){

            t.book.supportMaterials = data.length ? data.map(function(item){
              var truncatedDescription = item.field_description.substring(0,100);

              return {
                nid: item.nid,
                support_type: item.field_support_type,
                title: item.title,
                description: truncatedDescription + (truncatedDescription.length == 100 ? '&hellip;' : ''),
                icon: CONFIG.supportMaterialIconBaseUrl + item.field_image.filename,
                relatedBook: item.field_related_books[0],
                type: "support-material"
              }
            }) : null;

            if(data.length == 0) {
              t.book.noSupportMaterials = true;
            }
          });


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


          function trackFavorite(item) {
            var dl_obj = {
              nid: item.nid,
              title: item.title
            }

            dl_obj.type = item.type;

            if (item.type == 'support-material') {
              dl_obj.related_book_nid = t.book.nid;
              dl_obj.related_book_title = t.book.title;
            } else if (item.isbn) {
              dl_obj.isbn = t.book.isbn;
            }

            GTMService.trackAddFavorite(dl_obj);
          }

          t.addAll = function(evt) {
            var user = UserService.getUser();
            if(user) {
              var modal = ModalsService.getModal();
              modal.open(evt, {
                templateUrl: 'modals/add-favorite.html',
                size: 'sm',
                backdrop: 'static'
              }, {
                materials: t.book.supportMaterials
              }).result.then(function(result) {
                if(result.success) {
                  GTMService.trackFavoriteAll({
                    nid: t.book.nid,
                    title: t.book.title,
                    isbn: t.book.isbn
                  });

                  t.favoritesAdded.push('all');

                  if(t.favoritesAdded.indexOf(t.book.nid) == -1) {
                    t.favoritesAdded.push(t.book.nid);
                  }

                  angular.forEach(t.book.supportMaterials, function(materialObj) {
                    if(t.favoritesAdded.indexOf(materialObj.nid) == -1) {
                      t.favoritesAdded.push(materialObj.nid);
                    }
                    trackFavorite(materialObj);
                  });

                }

                if(result.success || result.action == 'cancel') {

                }
                if(result.action == 'submit') {
                  // add favorite to selected folder
                }
              }, function(err) {
                //do nothing
              });
            } else {
              showMessage(evt, 'Sign in or register for a Literacy Central account to favorite all support materials.');
            }
          }

          t.addFavorite = function (evt, materialObj) {
            var user = UserService.getUser();

            if(user) {
              var modal = ModalsService.getModal();
              modal.open(evt, {
                templateUrl: 'modals/add-favorite.html',
                size: 'sm',
                backdrop: 'static'
              }, {
                materials: [materialObj]
              }).result.then(function(result) {

                if(result.success) {
                  if(materialObj.relatedBook) {
                    if(t.favoritesAdded.indexOf(t.book.nid) == -1) {
                      t.favoritesAdded.push(t.book.nid);
                    }
                  }
                  if(t.favoritesAdded.indexOf(materialObj.nid) == -1) {
                    t.favoritesAdded.push(materialObj.nid);
                  }
                  trackFavorite(materialObj);
                }

                if(result.action == 'submit') {
                  // add favorite to selected folder
                }
              }, function(err) {
                //do nothing
              });
            } else {
              showMessage(evt, 'Sign in or register for a Literacy Central account to favorite this ' + (materialObj.type == 'book' ? 'book' : 'support material') + '.');
            }
          }



        }
      ],
      controllerAs: 'book',
      resolve: {
        bookResult: [
          '$stateParams',
          'AppData',
          function($stateParams, AppData) {
            if($stateParams.isbn) {
              return AppData.fetchBook($stateParams.isbn);
            }else {
              return null;
            }
          }
        ]
      }
    });

    $stateProvider.state('support-material', {
      url: '/support-material/:nid',
      templateUrl: 'views/support-material.html',
      data: {
        title: 'Support Material'
      },
      controller: [
        '$scope', '$stateParams','supportMaterialResult', 'literacyStandardsResult', 'FavoritesService', 'ModalsService', 'GTMService', 'UserService', 'AppData',
        function ($scope, $stateParams, supportMaterialResult, literacyStandardsResult, FavoritesService, ModalsService, GTMService, UserService, AppData) {
          var t = this;

          var material = supportMaterialResult;
          var standards = literacyStandardsResult;

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

          t.data = {
            nid: $stateParams.nid,
            ageRange: (material.field_age_range_min.value || '') + (material.field_age_range_max.value ? ' - ' + material.field_age_range_max.value : '') + ' Years',
            support_type: material.field_support_type,
            lexile: material.field_lexile_txt,
            title: material.title,
            description: material.field_description,
            icon: CONFIG.supportMaterialIconBaseUrl + material.field_image.filename,
            file: material.field_pdf_file_name ? CONFIG.supportMaterialFileBaseUrl + material.field_pdf_file_name : '',
            keywords: material.field_keywords && material.field_keywords.length ? material.field_keywords.join(', ') : '',
            literacy_standards: standards.map(function(standard) {
              return { title: standard.field_title, description: standard.field_lit_standards_description }
            }),
            relatedBook: material.field_related_books[0]
          };

          if(!material.field_age_range_min.value && !material.field_age_range_max.value) {
            t.data.ageRange = '';
          }

          t.addFavorite = function (evt, materialObj) {
            var user = UserService.getUser();

            if(user) {
            var modal = ModalsService.getModal();

            modal.open(evt, {
              templateUrl: 'modals/add-favorite.html',
              size: 'sm',
              backdrop: 'static'
            }, {
              materials: [materialObj]
            }).result.then(function(result) {
              if(result.success) {
                t.addedFavorite = true;
                // Fetch book title before tracking adding the favorite
                AppData.fetchEntityData(t.data.relatedBook, ['title']).then(function(data) {

                  GTMService.trackAddFavorite({
                    nid: t.data.nid,
                    title: t.data.title,
                    type: 'support-material',
                    related_book_nid: t.data.relatedBook,
                    related_book_title: data.title
                  });
                }).catch(function(err) {
                  GTMService.trackAddFavorite({
                    nid: t.data.nid,
                    title: t.data.title,
                    type: 'support-material',
                    related_book_nid: t.data.relatedBook,
                    related_book_title: ''
                  });
                });

              }

              if(result.success || result.action == 'cancel') {

              }
              if(result.action == 'submit') {
                // add favorite to selected folder
              }
            }, function(err) {
              //do nothing
            });
            }else {
              showMessage(evt, 'Sign in or register for a Literacy Central account to favorite this support material.');
            }
          }

          t.launchPDF = function(e) {
            var a = e.target;

            //Google Tag Manager Tracking
            GTMService.trackPDF({
              title: t.data.title,
              filename: t.data.file,
              nid: t.data.nid
            });

            if (!a) {
              return;
            }

            if (window.cordova && window.cordova.InAppBrowser && window.cordova.InAppBrowser.open) {
              window.cordova.InAppBrowser.open(a.href, a.target, 'location=no');
              e.preventDefault();
            }
          };
        }
      ],
      controllerAs: 'supportMaterial',
      resolve: {
        supportMaterialResult: [
          '$stateParams',
          'AppData',
          function($stateParams, AppData) {
            return AppData.fetchSupportMaterial($stateParams.nid);
          }
        ],
        literacyStandardsResult: [
          '$stateParams', 'AppData',
          function ($stateParams, AppData) {
            return AppData.fetchLiteracyStandards($stateParams.nid);
          }
        ]
      }
    });

    $stateProvider.state('favorites', {
      url: '/favorites',
      templateUrl: 'views/favorites.html',
      data: {
        title: 'My Favorites'
      },
      controller: [
        '$rootScope', '$scope', 'FavoritesService', 'UserService', 'ModalsService', 'foldersList',
        function ($rootScope, $scope, FavoritesService, UserService, ModalsService, foldersList) {
          var t = this;


          function getFavoritesFolderList() {
            FavoritesService.getFoldersList().then(function(data){
              t.data = {
                lists: [].concat(data)
              }

              t.new_folder_name = '';
            }).finally(function() {
              $rootScope.$emit('processingFinished');
            });
          }

          $scope.user = UserService.getUser();

          if($scope.user) {
            t.data = {
              lists: [].concat(foldersList)
            }
          }

          t.showSettings = function (evt, item) {
            var modal = ModalsService.getModal();

            modal.open(evt, {
              templateUrl: 'modals/folder-settings.html',
              size: 'sm',
              backdrop: 'static'
            }, {
              folder: item
            }).result.then(function(result) {
              if(result.success) {
                getFavoritesFolderList();
              }
            }, function(err) {
              //do nothing
            });
          }

          t.createFolder = function() {
            if(t.new_folder_name) {
              $rootScope.$emit('processingStart');
              FavoritesService.createFolder(t.new_folder_name).then(function(data) {
                getFavoritesFolderList();
              });
            }
          }

          $rootScope.$emit('processingFinished');
        }
      ],
      controllerAs: 'favorites',
      resolve: {
        foldersList: [
          '$rootScope', 'FavoritesService', 'UserService',
          function($rootScope, FavoritesService, UserService) {

            $rootScope.$emit('processingStart');
            return FavoritesService.getFoldersList();
          }
        ]
      }
    });

    $stateProvider.state('favorites-folder', {
      url: '/favorites/:nid',
      templateUrl: 'views/favorites-folder.html',
      params: {
        nid: '',
        title: ''
      },
      data: {
        title:'My Favorites'
      },
      controller: [
      '$rootScope', '$scope', '$state', '$stateParams', '$filter', 'folderTitle', 'folderContents', 'FavoritesService', 'UserService',
      function($rootScope, $scope, $state, $stateParams, $filter, folderTitle, folderContents, FavoritesService, UserService) {
        var t = this;

        function createResourceObject(item, type) {

          var truncatedDescription = item.field_description.substring(0, 100);

          return {
            nid: item.target_id,
            isbn: type == "Book Resource" ? item.field_isbn : null,
            title: item.title,
            description: truncatedDescription + (truncatedDescription.length == 100 ? '&hellip;' : ''),
            type: item.type,
            image: type == "Book Resource" ? CONFIG.bookCoverBaseUrl + item.field_book_cover_file_name : '',
            authors: type == "Book Resource" ? item.field_author : null,
            illustrators: type == "Book Resource" ? item.field_illustrator : null,
            icon: type == "Support Material" ? CONFIG.supportMaterialIconBaseUrl + item.field_image.filename : '',
            support_type: type == "Support Material" ? item.field_support_type : null,
            related_books: type == "Support Material" ? item.field_related_books : null
          }
        }

        t.title = folderTitle.title;
        t.resources = folderContents.map(function(item) {
          return createResourceObject(item, item.type);
        });

        function setListData() {
          t.books = $filter('filter')(t.resources, {type: "Book Resource"});

          t.bookSupportMaterials = (function(){
            var book_materials = {};
            t.books.forEach(function(item){
              book_materials[item.nid] = $filter('relatedBookId')(t.resources, item.nid);
            });

            return book_materials;
          })();
        }

        $scope.$watch("favoritesFolder.resources", function (newValue, oldValue) {
          setListData();
        });

        $scope.$on('removeItem', function(evt, data){
          var favObj = data.favObj;
          $rootScope.$emit('processingStart');
          FavoritesService.removeFavorite(favObj, $stateParams.nid).then(function(data) {
            t.resources = data.map(function(item) {
              return createResourceObject(item, item.type);
            });
            $rootScope.$emit('processingFinished');
          });
        });

        $rootScope.$emit('processingFinished');
      }],
      controllerAs: 'favoritesFolder',
      resolve: {
        folderContents: [
          '$rootScope', '$stateParams', 'FavoritesService',
          function($rootScope, $stateParams, FavoritesService) {
            $rootScope.$emit('processingStart');
            return FavoritesService.getFolderContents($stateParams.nid);
          }
        ],
        folderTitle: [
          '$stateParams', 'FavoritesService',
          function ($stateParams, FavoritesService) {
            return FavoritesService.getFolderName($stateParams.nid);
          }
        ]
      }
    });

    $stateProvider.state('settings', {
      url: '/settings',
      templateUrl: 'views/settings.html',
      data: {
        title: 'Settings'
      },
      controller: [
      '$scope','UserService',
      function($scope, UserService) {
        $scope.user = UserService.getUser();
      }]
    });

    $stateProvider.state('help', {
      url: '/help',
      templateUrl: 'views/help.html',
      data: {
        title: 'Help'
      },
      controller: [
      'CONFIG', 'GTMService',
      function(CONFIG, GTMService) {
        var t= this;

        t.websiteUrl = CONFIG.siteBaseUrl;
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
      }],
      controllerAs: 'help'
    });

  }
]);
