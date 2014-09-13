'use strict';

/* Controllers */

mydmsApp.controller('LanguageController', ['$scope', '$translate', function ($scope, $translate) {
  $scope.changeLanguage = function (languageKey) {
    $translate.use(languageKey);
  };
}]);

mydmsApp.controller('AccountController', ['$scope'
  , 'backendService'
  , function ($scope
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

}]);