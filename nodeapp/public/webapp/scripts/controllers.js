'use strict';

/* Controllers */

mydmsApp.controller('MainController', ['$scope',
    function ($scope) {
    }]);

mydmsApp.controller('LanguageController', ['$scope', '$translate',
    function ($scope, $translate) {
        $scope.changeLanguage = function (languageKey) {
            $translate.uses(languageKey);
        };
    }]);

mydmsApp.controller('MenuController', ['$scope',
    function ($scope) {
    }]);