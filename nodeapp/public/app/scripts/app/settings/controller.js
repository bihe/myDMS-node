'use strict';

/* Controllers */

/*
 * handle settings
 */
mydmsApp.controller('SettingsController', ['$scope'
  , '$rootScope'
  , 'backendService'
  , '$location'
  , '$routeParams'
  , '_'
  , '$modal'
  , '$window'
  , function ($scope
    , $rootScope
    , backendService
    , $location
    , $routeParams
    , _
    , $modal
    , $window) {

    // ------------------------------------------------------------------------
    // scope variables
    // ------------------------------------------------------------------------
    $scope.activeTab = 'tabImport';
    $scope.input = {};
    $scope.rawSendersValid = true;
    $scope.rawTagsValid = true;
    $scope.rawDocumentsValid = true;
    $scope.saveSuccess = true;
    $scope.action = false;
    $scope.saveMessage = '';
    $scope.saveErrorMessage = '';
    $scope.googleDrive = {};
    $scope.googleDrive.isActive = false;
    $scope.googleDrive.isProvided = false;

    var myModal = $modal({ scope: $scope
      , title: 'Connect Drive'
      , contentTemplate: 'views/connectDrive.html'
      , show: false
      , prefixEvent: 'settings'
    });

    // ------------------------------------------------------------------------
    // startup actions / events
    // ------------------------------------------------------------------------
    if($routeParams && $routeParams.connectionState) {
      // TODO: verify the connection
      console.log('got connection state: ' + $routeParams.connectionState);
      $scope.activeTab = 'tabDrive';
      $scope.googleDrive.isProvided = true;
      $scope.googleDrive.isActive = true;
    }


    // ------------------------------------------------------------------------
    // actions
    // ------------------------------------------------------------------------

    // show a specific tab
    $scope.showTab = function(tab) {
      $scope.activeTab = tab;
    };

    // navigate back to main screen
    $scope.cancel = function(path) {
      $location.path(path);
    };

    // use the raw-json and post it to the backend service
    $scope.save = function() {
      var payLoad = {}, postData;

      $scope.action = true;

      // setup structure - the payload are just strings
      $scope.rawTagsValid = $scope.rawSendersValid = $scope.rawDocumentsValid = true;
      try {
        if($scope.input.rawTags && $scope.input.rawTags !== '') {
          $scope.rawTagsValid = false;
          payLoad.tags = JSON.parse($scope.input.rawTags);
          $scope.rawTagsValid = true;
        }
        if($scope.input.rawSenders && $scope.input.rawSenders !== '') {
          $scope.rawSendersValid = false;
          payLoad.senders = JSON.parse($scope.input.rawSenders);
          $scope.rawSendersValid = true;
        }
        if($scope.input.rawDocuments && $scope.input.rawDocuments !== '') {
          $scope.rawDocumentsValid = false;
          payLoad.documents = JSON.parse($scope.input.rawDocuments);
          $scope.rawDocumentsValid = true;
        }

      } catch(err) {
        // cannot parse
        console.log(err);
        $scope.saveSuccess = false;
        $scope.saveErrorMessage = err.message;
        return;
      }

      postData = JSON.stringify(payLoad);

      // POST
      // create a new entry
      backendService.processSettings(postData).success(function (data, status, headers, config) {
        $scope.saveSuccess = true;
        $scope.saveMessage = data;
        $scope.input = {}; // clear input

      }).error(function (data, status, headers, config) {
        $scope.saveSuccess = false;
        $scope.saveErrorMessage = data;
      });
    };

    // start the google drive connection
    $scope.startConnect = function() {
      if(!$scope.googleDrive.isProvided) {
        myModal.$promise.then(myModal.show);
      }
    };

    // create google drive connection
    $scope.connect = function() {
      console.log('connect google drive!');
      // redirect to start the oauth logic
      $window.location.href = '/oauth/connect';
    };

    // ------------------------------------------------------------------------
    // watch scope elements
    // ------------------------------------------------------------------------

    $scope.$watch('googleDrive.isActive', function() {
      console.info('Google Drive switch selected: ' + $scope.googleDrive.isActive);
      if($scope.googleDrive.isActive === true) {
        $scope.startConnect();
      } else {
        $scope.googleDrive.isProvided = false;
      }
    });

    // ------------------------------------------------------------------------
    // events
    // ------------------------------------------------------------------------

    // actions based on the hide setting modal
    var unbind = $rootScope.$on('settings.hide', function(args){
      console.log('modal closed!');
      args.stopPropagation(); // ok - done here
    });
    $scope.$on('$destroy', unbind);
}]);