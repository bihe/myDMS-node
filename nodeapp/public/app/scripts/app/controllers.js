'use strict';

/* Controllers */

mydmsApp.controller('LanguageController', ['$scope', '$location', '$translate', function ($scope, $location, $translate) {
  $scope.changeLanguage = function (languageKey) {
    $translate.use(languageKey);
  };
}]);

mydmsApp.controller('AccountController', ['$scope'
  , '$location'
  , 'backendService'
  , function ($scope
    , $location
    , backendService) {

    // ------------------------------------------------------------------------
    // scope variables
    // ------------------------------------------------------------------------
    $scope.user = {};

    // ------------------------------------------------------------------------
    // startup-logic
    // ------------------------------------------------------------------------
    backendService.getUser().success(function (data, status, headers, config) {
      $scope.user = data;
    }).error(function (data, status, headers, config) {
      console.log('Error: ' + data);
    });

    // ------------------------------------------------------------------------
    // actions
    // ------------------------------------------------------------------------
    $scope.logout = function() {
      backendService.logoutUser().success(function (data, status, headers, config) {
        //$location.path('/');
        window.location = '/';
        return;
      }).error(function (data, status, headers, config) {
        console.log('Error: ' + data);
        alert('Error: ' + data);
      });
    };

}]);