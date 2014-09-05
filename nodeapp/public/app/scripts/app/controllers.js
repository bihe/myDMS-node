'use strict';

/* Controllers */

mydmsApp.controller('LanguageController', ['$scope', '$translate', function ($scope, $translate) {
  $scope.changeLanguage = function (languageKey) {
    $translate.use(languageKey);
  };
}]);

mydmsApp.controller('MenuController', ['$scope', function ($scope) {
}]);