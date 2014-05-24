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

}]);