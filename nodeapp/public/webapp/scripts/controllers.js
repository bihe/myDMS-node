'use strict';

/* Controllers */



mydmsApp.controller('LanguageController', ['$scope', '$translate', function ($scope, $translate) {
  $scope.changeLanguage = function (languageKey) {
    $translate.uses(languageKey);
  };
}]);

mydmsApp.controller('MenuController', ['$scope', function ($scope) {
}]);

/*
 * handle the documents
 */
mydmsApp.controller('MainController', ['$scope', '$http', function ($scope, $http) {

  // retrieve the documents on load
  $http.get('./api/1.0/documents').success( function(data) {
    $scope.documents = data;
    }).error( function(data, status, headers) {
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });
}]);

/*
 * handle tags interaction
 */
mydmsApp.controller('TagsController', ['$scope', '$http', function ($scope, $http){

  // retrieve the tags on load
  $http.get('./api/1.0/tags').success( function(data) {
    $scope.tags = data;
    }).error( function(data, status, headers) {
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });
  
}]);