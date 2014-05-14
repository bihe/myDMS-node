'use strict';

/* Controllers */

mydmsApp.controller('LanguageController', ['$scope', '$translate', function ($scope, $translate) {
  $scope.changeLanguage = function (languageKey) {
    $translate.uses(languageKey);
  };
}]);

mydmsApp.controller('MenuController', ['$scope', function ($scope) {
}]);