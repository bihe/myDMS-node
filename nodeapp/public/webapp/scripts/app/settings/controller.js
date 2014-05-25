'use strict';

/* Controllers */

/*
 * handle settings
 */
mydmsApp.controller('SettingsController', ['$scope', '$http', '$location', '$routeParams', '_', function ($scope, $http, $location, $routeParams, _) {

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
    $http({
      url: './api/1.0/settings/',
      method: 'POST',
      data: postData,
      headers: {'Content-Type': 'application/json'}
    }).success(function (data, status, headers, config) {
      $scope.saveSuccess = true;
      $scope.saveMessage = data;
      $scope.input = {}; // clear input

    }).error(function (data, status, headers, config) {
      $scope.saveSuccess = false;
      $scope.saveErrorMessage = data;
    });
  };

}]);