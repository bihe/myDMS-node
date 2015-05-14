(function() {
  'use strict';

  // module
  angular
    .module('mydms.main')
    .controller('MainController', ['$scope'
      , '$rootScope'
      , '$location'
      , '$timeout'
      , 'backendService'
      , 'stateService'
      , 'storageService'
      , '_'
      , mainController
    ])
    .controller('LanguageController', ['$location'
      , '$translate'
      , '$rootScope'
      , languageController
    ])
    .controller('AccountController', ['$scope'
      , '$location'
      , 'backendService'
      , '$rootScope'
      , '$window'
      , accountController
    ])
    ;

  /**
   * logic for account handling
   */
  function accountController($scope, $location, backendService, $rootScope, $window) {
    var vm = this;

    // init
    vm.user = {};

    load();


    //////////////////

    /**
     * startup
     */
    function load() {
      backendService.getUser().success(function (data, status, headers, config) {
        vm.user = data;
      }).error(function (data, status, headers, config) {
        console.log('Error: ' + data);

        if(status === 403) {
          $rootScope.$emit('::authError::');
          return;
        }
      });
    }


    //////////////////
    // actions
    //////////////////


    vm.logout = function() {
      backendService.logoutUser().success(function (data, status, headers, config) {
        //$location.path('/');
        window.location = '/';
        return;
      }).error(function (data, status, headers, config) {
        console.log('Error: ' + data);
        alert('Error: ' + data);

        if(status === 403) {
          $rootScope.$emit('::authError::');
          return;
        }
      });
    };

    //////////////////
    // events
    //////////////////

    // act on authentication error event
    // redirect the user to a login screen
    var unbindAuth = $rootScope.$on('::authError::', function(args){
      console.log('Authentication error - redirect to login!');
      $window.location.href = '/auth/login';
      args.stopPropagation(); // ok - done here
      return;
    });

    // cleanup
    $scope.$on('$destroy', function() {
     unbindAuth();
    });

  }

  /**
   * perform the translation
   */
  function languageController($ocation, $translate, $rootScope) {
    var vm = this;

    /**
     * perform the actual translation
     */
    vm.changeLanguage = function (languageKey) {
      $translate.use(languageKey);
    };
  }

  /**
   * logic of the "main-form"
   */
  function mainController($scope
    , $rootScope
    , $location
    , $timeout
    , backendService
    , stateService
    , storageService
    , _
    ) {

      var vm = this;
      var maxResults = 40;
      var WAIT = 800;


      ////////////

      /**
       * initialisation
       */
      function init() {
        vm.search = {};
        vm.documents = [];
        vm.senders = [];
        vm.tags = [];
        vm.page = 0;
        vm.busy = false;
        vm.loading = false;
        vm.toggleShowOptions = false;


        // events
        var unbind = $rootScope.$on('::doSearch::', function(args){
          vm.doSearch();
          args.stopPropagation(); // ok - done here
        });
        // cleanup
        $scope.$on('$destroy', function() {
          unbind();
        });
      }


      /**
       * load data
       */
      function loadData() {

        // ------------------------------------------------------------------------
        // startup - fetch remote data
        // ------------------------------------------------------------------------

        if(stateService.getInit() === true) {
          var state = stateService.get(),
              index = -1;

          // retrieve the senders on load
          backendService.getSenders().success( function(data) {
            vm.senders = data;

            // retrieve the tags on load
            backendService.getTags().success( function(data) {
              vm.tags = data;

              vm.search = state.search;

              // find the selected entry of senders
              if(vm.search.sender) {
                index = _.findIndex(vm.senders, function(sender) {
                  return sender._id === vm.search.sender._id;
                });
                vm.search.sender = vm.senders[index];
              }

              // find the selected entry of tags
              if(vm.search.tag) {
                index = _.findIndex(vm.tags, function(tag) {
                  return tag._id === vm.search.tag._id;
                });
                vm.search.tag = vm.tags[index];
              }

              vm.documents = [];
              vm.page = state.page;
              vm.busy = vm.loading = false;
              $rootScope.$emit('::doSearch::');

            }).error( function(data, status, headers) {

              if(status === 403) {
                $rootScope.$emit('::authError::');
                return;
              }

              alert('Error: ' + data + '\nHTTP-Status: ' + status);
            });

          }).error( function(data, status, headers) {

            if(status === 403) {
              $rootScope.$emit('::authError::');
              return;
            }

            alert('Error: ' + data + '\nHTTP-Status: ' + status);
          });

        } else {

          // retrieve the documents on load
          // $scope.busy = $scope.loading = true;
          // backendService.getDocuments().success( function(data) {
          //   $scope.documents = data;
          //   $scope.page = 1;
          //   $scope.busy = $scope.loading = false;
          // }).error( function(data, status, headers) {
          //   alert('Error: ' + data + '\nHTTP-Status: ' + status);
          // });
          $rootScope.$emit('::doSearch::');

          // retrieve the senders on load
          backendService.getSenders().success( function(data) {
            vm.senders = data;
          }).error( function(data, status, headers) {

            if(status === 403) {
              $rootScope.$emit('::authError::');
              return;
            }

            alert('Error: ' + data + '\nHTTP-Status: ' + status);
          });

          // retrieve the tags on load
          backendService.getTags().success( function(data) {
            vm.tags = data;
          }).error( function(data, status, headers) {

            if(status === 403) {
              $rootScope.$emit('::authError::');
              return;
            }

            alert('Error: ' + data + '\nHTTP-Status: ' + status);
          });
        }

      }


      ////////////
      // actions
      ////////////

      vm.showMoreSearchOptions = function() {
        vm.toggleShowOptions = !vm.toggleShowOptions;
      };

      vm.editDocument = function(id) {
        stateService.set(vm);
        $location.path('/document/' + id);
      };

      // perform a search
      vm.doSearch = function() {
        vm.search.skip = 0;
        vm.page = 0;
        vm.documents = [];
        vm._backendSearch(vm.page, vm.search.skip, false);
      };

      vm.doSearchWait = function() {
        // only search if 3 chars were entered and add 500ms before search
        console.log(vm.search.term);
        if(vm.search.term.length >= 3 || vm.search.term.length === 0) {
          if(vm.busy === false) {
            vm.busy = true;
            $timeout(vm.doSearch, WAIT);
          }
        }
      };

      // fetch more results to show
      vm.moreResults = function() {
        if (vm.busy) {
          return;
        }
        vm.busy = vm.loading = true;

        console.log('fetching more results for page ' + vm.page);

        vm.search.skip = vm.page * maxResults;
        vm._backendSearch(vm.page, vm.search.skip);
      };

      // internal logic - query the backend system
      vm._backendSearch = function(page, skip, showLoading) {
        if(showLoading === false) {
          vm.busy = true;
          vm.loading = false;
        } else {
          vm.busy = vm.loading = true;
        }

        console.log('Start search ' + vm.search.term);
        backendService.searchDocuments(vm.search, vm.selectedTags,
          page, skip, maxResults).success( function(data) {
          if(data && data.length > 0) {
            for (var i = 0; i < data.length; i++) {
              vm.documents.push(data[i]);
            }
            vm.page = page + 1;
            vm.busy = vm.loading = false; // operation done
          } else {
            vm.busy = vm.loading = false;
          }
        }).error( function(data, status, headers) {

          if(status === 403) {
            $rootScope.$emit('::authError::');
            return;
          }

          vm.busy = vm.loading = false; // also done
          alert('Error: ' + data + '\nHTTP-Status: ' + status);
        });
      };





      //////////////////


      init();
      loadData();

      // not the best-thing but I do not care!
      //$('#documentContainer').css({ 'height' : ($(window).height() - 50) + 'px', 'overflow': 'auto' });

  }


})();
