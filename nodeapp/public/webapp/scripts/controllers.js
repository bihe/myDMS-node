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
mydmsApp.controller('DocumentController', ['$scope', '$http', '$location', '$routeParams', '_', function ($scope, $http, $location, $routeParams, _) {
  
  // ------------------------------------------------------------------------
  // initialisation
  // ------------------------------------------------------------------------

  $scope.document = {};
  $scope.document.id = -1;
  $scope.document.tags = [];

  if($routeParams && $routeParams.documentId) {
    $scope.document.id = $routeParams.documentId;
  }

  console.log($routeParams);

  // retrieve the senders on load
  $http.get('./api/1.0/senders').success( function(data) {
    $scope.senders = data;
  }).error( function(data, status, headers) {
    alert('Error: ' + data + '\nHTTP-Status: ' + status);
  });


  // ------------------------------------------------------------------------
  // actions
  // ------------------------------------------------------------------------

  // navigate back to main screen
  $scope.cancel = function(path) {
    $location.path(path);
  };

  // remove the tag from the list
  $scope.removeTag = function(tagId) {
    _.remove($scope.document.tags, function(tag) {
      return tag._id === tagId;
    });
  };

  // callback is triggered from the autocomplete component
  $scope.addNewTagCallback = function(text) {
    if(text && text !== '') {
      var found = _.find($scope.document.tags, function(tag) {
        return tag.name === text;
      });
      if(!found) {
        var tag = {};
        tag.name = text;
        tag._id = -1;
        $scope.document.tags.push(tag);
      }
    }
  };


  // ------------------------------------------------------------------------
  // event handler
  // ------------------------------------------------------------------------

  // watch for changes
  $scope.$watch('selectedTag', function (newValue) {
    if(newValue) {
      if(newValue.originalObject) {
        var found = _.find($scope.document.tags, function(tag) {
          return tag._id === newValue.originalObject._id;
        });
        if(!found) {
          $scope.document.tags.push(newValue.originalObject);
        }
      }
      console.log('selectedTag changed!' + newValue);
    }
    
  });

}]);