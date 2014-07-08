'use strict';

/*
 * handel the main screen
 */
mydmsApp.controller('MainController', ['$scope', '$http', function ($scope, $http) {

  // ------------------------------------------------------------------------
  // initialisation
  // ------------------------------------------------------------------------
  var maxResults = 20;

  $scope.search = {};
  $scope.page = 0;
  $scope.busy = false;

  $scope.selectedTags = [];

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

  // perform a search 
  $scope.search = function() {
    $scope.search.skip = 0;
    $scope.page = 0;
    $scope.documents = [];
    $scope._backendSearch($scope.page, $scope.search.skip);
  };

  // fetch more results to show
  $scope.moreResults = function() {
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;

    console.log('fetching more results for page ' + $scope.page);
    $scope.search.skip = $scope.page * maxResults;
    $scope._backendSearch($scope.page, $scope.search.skip);
  };

  // internal logic - query the backend system
  $scope._backendSearch = function(page, skip) {

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
      query += '&sender=' + $scope.search.sender._id;
    }
    if($scope.selectedTags) {
      var idlist = '';
      if($scope.selectedTags.length == 1) {
        idlist = $scope.selectedTags[0]._id;
      } else {
        for (var i = 0; i < $scope.selectedTags.length; i++) {
          if(i > 0) {
            idlist += ',';
          }
          idlist += $scope.selectedTags[i]._id;
        }
      }
      query += '&tag=' + idlist;
    }
    query += '&limit=' + maxResults;
    query += '&skip=' + skip;

    $http.get('./api/1.0/documents?a=b' + query).success( function(data) {
      if(data && data.length > 0) {
        for (var i = 0; i < data.length; i++) {
          $scope.documents.push(data[i]);
        }
        $scope.page = page + 1;
        $scope.busy = false; // operation done
      }
    }).error( function(data, status, headers) {
      $scope.busy = false; // also done
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });
  };

}]);