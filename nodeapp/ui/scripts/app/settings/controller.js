(function() {
  'use strict';

  // module
  angular
    .module('mydms.settings')
    .controller('SettingsController', ['$scope'
      , '$rootScope'
      , 'backendService'
      , '$location'
      , '$routeParams'
      , '_'
      , '$modal'
      , '$window'
      , settingsController
    ])
    ;


  function settingsController($scope
    , $rootScope
    , backendService
    , $location
    , $routeParams
    , _
    , $modal
    , $window) {

      var vm = this;
      var myModal = $modal({ scope: vm
        , title: 'Connect Drive'
        , contentTemplate: 'views/connectDrive.html'
        , show: false
        , prefixEvent: 'settings'
      });

      init();
      load();


      //////////////////


      /**
       * setup environment
       */
      function init() {
        vm.activeTab = 'tabImport';
        vm.input = {};
        vm.rawSendersValid = true;
        vm.rawTagsValid = true;
        vm.rawDocumentsValid = true;
        vm.saveSuccess = true;
        vm.action = false;
        vm.saveMessage = '';
        vm.saveErrorMessage = '';
        vm.connection = 0;
        vm.googleDrive = {};
        vm.googleDrive.isActive = false;
        vm.googleDrive.isProvided = false;
        vm.maintenance = {};
        vm.maintenance.deletetempfiles = false;
        vm.maintenance.deletedirtydbentries = false;


        // setup events

        // actions based on the hide setting modal
        var unbind = $rootScope.$on('settings.hide', function(args){
          console.log('modal closed!');
          args.stopPropagation(); // ok - done here
        });
        $scope.$on('$destroy', unbind);


        $scope.$watch('vm.googleDrive.isActive', function() {
          console.info('Google Drive switch selected: ' + vm.googleDrive.isActive);
          if(vm.googleDrive.isActive === true) {
            vm.startConnect();
          } else {
            vm.startDisconnect();
          }
        });

      }

      /**
       * startup actions / events
       */
      function load() {
        backendService.getUser().success(function (data, status, headers, config) {
          if(data.hasToken) {
            vm.googleDrive.isProvided = true;
            vm.googleDrive.isActive = true;
            vm.connection = 1;
          }
        }).error(function (data, status, headers, config) {
          console.log('Error: ' + data);
        });

        if($routeParams && $routeParams.connection) {
          vm.activeTab = 'tabDrive';
        }
      }


      //////////////////
      // actions
      //////////////////

      // show a specific tab
      vm.showTab = function(tab) {
        vm.activeTab = tab;
      };

      // navigate back to main screen
      vm.cancel = function(path) {
        $location.path(path);
      };

      // use the raw-json and post it to the backend service
      vm.save = function() {
        var payLoad = {}, postData;

        vm.action = true;

        // setup structure - the payload are just strings
        vm.rawTagsValid = vm.rawSendersValid = vm.rawDocumentsValid = true;
        try {
          if(vm.input.rawTags && vm.input.rawTags !== '') {
            vm.rawTagsValid = false;
            payLoad.tags = JSON.parse(vm.input.rawTags);
            vm.rawTagsValid = true;
          }
          if(vm.input.rawSenders && vm.input.rawSenders !== '') {
            vm.rawSendersValid = false;
            payLoad.senders = JSON.parse(vm.input.rawSenders);
            vm.rawSendersValid = true;
          }
          if(vm.input.rawDocuments && vm.input.rawDocuments !== '') {
            vm.rawDocumentsValid = false;
            payLoad.documents = JSON.parse(vm.input.rawDocuments);
            vm.rawDocumentsValid = true;
          }

        } catch(err) {
          // cannot parse
          console.log(err);
          vm.saveSuccess = false;
          vm.saveErrorMessage = err.message;
          return;
        }

        postData = JSON.stringify(payLoad);

        // POST
        // create a new entry
        backendService.processSettings(postData).success(function (data, status, headers, config) {
          vm.saveSuccess = true;
          vm.saveMessage = data;
          vm.input = {}; // clear input

        }).error(function (data, status, headers, config) {
          vm.saveSuccess = false;
          vm.saveErrorMessage = data;
        });
      };

      // start the google drive connection
      vm.startConnect = function() {
        if(!vm.googleDrive.isProvided) {
          myModal.$promise.then(myModal.show);
        }
      };

      // disconnect google drive
      vm.startDisconnect = function() {
        if(vm.googleDrive.isProvided) {
          myModal.$promise.then(myModal.show);
        }
      };

      // create google drive connection
      vm.connect = function() {
        console.log('connect google drive!');
        // redirect to start the oauth logic
        $window.location.href = '/drive/connect';
      };

      // create google drive connection
      vm.disconnect = function() {
        console.log('disconnect google drive!');
        // redirect to start the oauth logic
        $window.location.href = '/drive/disconnect';
      };

      // start the maintenance work stuff
      vm.dowork = function() {
        if(vm.maintenance.deletetempfiles ||  vm.maintenance.deletedirtydbentries) {
          backendService.doMaintenance(vm.maintenance).success(function (data, status, headers, config) {
            vm.actionSuccess = true;
            vm.actionError = false;
            vm.actionMessage = data;

            vm.maintenance.deletetempfiles = vm.maintenance.deletedirtydbentries = false;

          }).error(function (data, status, headers, config) {
            vm.actionError = true;
            vm.actionSuccess = false;
            vm.actionMessage = data;
          });
        } else {
          return;
        }
      };



    }

})();
