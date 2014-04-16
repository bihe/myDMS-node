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
 * handel the main screen
 */
mydmsApp.controller('MainController', ['$scope', '$http', function ($scope, $http) {

  // retrieve the documents on load
  $http.get('./api/1.0/documents').success( function(data) {
    $scope.documents = data;
    }).error( function(data, status, headers) {
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });

  // retrieve the tags on load
  $http.get('./api/1.0/tags').success( function(data) {
    $scope.tags = data;
    }).error( function(data, status, headers) {
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });

}]);

/*
 * handle the documents
 */
mydmsApp.controller('DocumentController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
  $scope.document = {};
  $scope.document.id = -1;

  if($routeParams && $routeParams.documentId) {
    $scope.document.id = $routeParams.documentId;
  }

  console.log($routeParams);

}]);