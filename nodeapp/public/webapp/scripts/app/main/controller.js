'use strict';

/*
 * handel the main screen
 */
mydmsApp.controller('MainController', ['$scope', '$http', function ($scope, $http) {

  // ------------------------------------------------------------------------
  // initialisation
  // ------------------------------------------------------------------------
  $scope.search = {};


  // ------------------------------------------------------------------------
  // startup - fetch remote data
  // ------------------------------------------------------------------------  

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


  // ------------------------------------------------------------------------
  // actions
  // ------------------------------------------------------------------------

  // navigate back to main screen
  $scope.search = function() {
    if(!$scope.search.term || $scope.search.term === '') {
      $scope.search.term = '*';
    }
    $http.get('./api/1.0/documents?q=' + $scope.search.term).success( function(data) {
      $scope.documents = data;
    }).error( function(data, status, headers) {
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });
  };


}]);