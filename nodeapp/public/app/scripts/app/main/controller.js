'use strict';

/*
 * handel the main screen
 */
mydmsApp.controller('MainController', ['$scope'
  , '$rootScope'
  , '$location'
  , 'backendService'
  , 'stateService'
  , 'storageService'
  , '_'
  , function ($scope
    , $rootScope
    , $location
    , backendService
    , stateService
    , storageService
    , _) {

  // ------------------------------------------------------------------------
  // initialisation
  // ------------------------------------------------------------------------
  var maxResults = 40;

  $scope.search = {};
  $scope.documents = [];
  $scope.senders = [];
  $scope.tags = [];
  $scope.page = 0;
  $scope.busy = false;
  $scope.loading = false;

  // ------------------------------------------------------
  // events
  // ------------------------------------------------------
  
  /**
   * perform a search
   */
  var unbind = $rootScope.$on('::doSearch::', function(args){
    $scope.doSearch();
     args.stopPropagation(); // ok - done here
  });
  $scope.$on('$destroy', unbind);


  // ------------------------------------------------------------------------
  // actions
  // ------------------------------------------------------------------------

  $scope.editDocument = function(id) {
    stateService.set($scope);
    $location.path('/document/' + id);
  };

  // perform a search 
  $scope.doSearch = function() {
    $scope.search.skip = 0;
    $scope.page = 0;
    $scope.documents = [];
    $scope._backendSearch($scope.page, $scope.search.skip, false);
  };

  // fetch more results to show
  $scope.moreResults = function() {
    if ($scope.busy) {
      return;
    }
    $scope.busy = $scope.loading = true;

    console.log('fetching more results for page ' + $scope.page);

    $scope.search.skip = $scope.page * maxResults;
    $scope._backendSearch($scope.page, $scope.search.skip);
  };

  // internal logic - query the backend system
  $scope._backendSearch = function(page, skip, showLoading) {
    if(showLoading === false) {
      $scope.busy = true;
      $scope.loading = false;
    } else {
      $scope.busy = $scope.loading = true;
    }
    
    backendService.searchDocuments($scope.search, $scope.selectedTags,
      page, skip, maxResults).success( function(data) {
      if(data && data.length > 0) {
        for (var i = 0; i < data.length; i++) {
          $scope.documents.push(data[i]);
        }
        $scope.page = page + 1;
        $scope.busy = $scope.loading = false; // operation done
      } else {
        $scope.busy = $scope.loading = false;
      }
    }).error( function(data, status, headers) {
      $scope.busy = $scope.loading = false; // also done
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });
  };


  // ------------------------------------------------------------------------
  // startup - fetch remote data
  // ------------------------------------------------------------------------  

  if(stateService.getInit() === true) {
    var state = stateService.get(),
        index = -1;

    // retrieve the senders on load
    backendService.getSenders().success( function(data) {
      $scope.senders = data;

      // retrieve the tags on load
      backendService.getTags().success( function(data) {
        $scope.tags = data;

        $scope.search = state.search;

        // find the selected entry of senders
        if($scope.search.sender) {
          index = _.findIndex($scope.senders, function(sender) {
            return sender._id == $scope.search.sender._id;
          });
          $scope.search.sender = $scope.senders[index];
        }

        // find the selected entry of tags
        if($scope.search.tag) {
          index = _.findIndex($scope.tags, function(tag) {
            return tag._id == $scope.search.tag._id;
          });
          $scope.search.tag = $scope.tags[index];
        }

        $scope.documents = [];
        $scope.page = state.page;
        $scope.busy = $scope.loading = false;
        $rootScope.$emit('::doSearch::');

      }).error( function(data, status, headers) {
        alert('Error: ' + data + '\nHTTP-Status: ' + status);
      });

    }).error( function(data, status, headers) {
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });

  } else {
  
    // retrieve the documents on load
    $scope.busy = $scope.loading = true;
    backendService.getDocuments().success( function(data) {
      $scope.documents = data;
      $scope.busy = $scope.loading = false;
    }).error( function(data, status, headers) {
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });

    // retrieve the senders on load
    backendService.getSenders().success( function(data) {
      $scope.senders = data;
    }).error( function(data, status, headers) {
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });

    // retrieve the tags on load
    backendService.getTags().success( function(data) {
      $scope.tags = data;
    }).error( function(data, status, headers) {
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });
  }

}]);