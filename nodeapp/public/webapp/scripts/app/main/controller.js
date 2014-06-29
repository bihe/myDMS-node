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

  // retrieve the senders on load
  $http.get('./api/1.0/senders').success( function(data) {
    $scope.senders = data;
  }).error( function(data, status, headers) {
    alert('Error: ' + data + '\nHTTP-Status: ' + status);
  });


  $scope.selectedSenders = [];

  // ------------------------------------------------------------------------
  // actions
  // ------------------------------------------------------------------------

  $scope.filter = function(tagId) {
    $scope.search.tagId = tagId;
    $scope.search();
  }

  // navigate back to main screen
  $scope.search = function() {

    var query = '';
    if($scope.search.term) {
      query += '&t=' + $scope.search.term;
    }
    if($scope.search.dateFrom) {
      query += '&df=' + $scope.search.dateFrom;
    }
    if($scope.search.dateTo) {
      query += '&dt=' + $scope.search.dateTo;
    }
    if($scope.search.sender) {
      query += '&s=' + $scope.search.sender._id;
    }
    if($scope.search.tagId) {
      query += '&tag=' + $scope.search.tagId;
    }

    $http.get('./api/1.0/documents?a=b' + query).success( function(data) {
      $scope.documents = data;
    }).error( function(data, status, headers) {
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });
  };


}]);