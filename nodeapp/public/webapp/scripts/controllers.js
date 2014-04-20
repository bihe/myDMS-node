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
mydmsApp.controller('DocumentController', ['$scope', '$http', '$location', '$routeParams', '_', '$upload', function ($scope, $http, $location, $routeParams, _, $upload) {
  
  // ------------------------------------------------------------------------
  // initialisation
  // ------------------------------------------------------------------------
  $scope.uploadError = null;
  $scope.formValidationError = false;
  $scope.document = {};
  $scope.document.id = -1;
  $scope.document.title = '';
  $scope.document.fileName = '';
  $scope.document.amount = null;
  $scope.document.sender = [];
  $scope.document.tags = [];

  if($routeParams && $routeParams.documentId) {
    $scope.document.id = $routeParams.documentId;
  }

  console.log($routeParams);

  // retrieve the senders on load
  $http.get('./api/1.0/senders').success( function( data ) {
    $scope.senders = data;
  }).error( function( data, status, headers ) {
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
    $scope.selectedTag = null;
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

  // also handle the logic for senders
  $scope.addNewSenderCallback = function(text) {
    if(text && text !== '') {
      var found = _.find($scope.document.sender, function(sender) {
        return sender.name === text;
      });
      if(!found) {
        var sender = {};
        sender.name = text;
        sender._id = -1;
        $scope.document.sender = [];
        $scope.document.sender.push(sender);
      }
    }
  };

  // save the document
  $scope.save = function(valid) {
    $scope.formValidationError = false;
    if(!valid) {
      $scope.formValidationError = true;
    }

    // $scope.document.title = '';
    // $scope.document.fileName = '';
    // $scope.document.amount = 0.0;
    // $scope.document.sender = [];
    // $scope.document.tags = [];
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

  // watch for changes
  $scope.$watch('selectedSender', function (newValue) {
    if(newValue) {
      if(newValue.originalObject) {
        var found = _.find( $scope.document.sender, function( sender ) {
          return sender._id === newValue.originalObject._id;
        });
        if(!found) {
          $scope.document.sender.push( newValue.originalObject );
        }
      }
      console.log('selectedSender changed!' + newValue);
    }
  });


  // ------------------------------------------------------------------------
  // file upload logic using angular-file-upload.js
  // ------------------------------------------------------------------------

  $scope.onFileSelect = function($files) {
    $scope.uploadError = null;
    $scope.document.originalFilename = null;
    $scope.document.tempFilename = null;
    $scope.document.size = null;

    //$files: an array of files selected, each file has name, size, and type.
    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];
      $scope.upload = $upload.upload({
        url: '/api/1.0/documents/upload', //upload.php script, node.js route, or servlet url
        // method: POST or PUT,
        // headers: {'header-key': 'header-value'},
        // withCredentials: true,
        data: { myObj: $scope.myModelObj },
        file: file, // or list of files: $files for html5 only
        /* set the file formData name ('Content-Desposition'). Default is 'file' */
        //fileFormDataName: myFile, //or a list of names for multiple files (html5).
        /* customize how data is added to formData. See #40#issuecomment-28612000 for sample code */
        //formDataAppender: function(formData, key, val){}
      }).progress(function(evt) {
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).success(function(data, status, headers, config) {
        // file is uploaded successfully
        console.log(data);
        $scope.document.originalFilename = data.originalFileName;
        $scope.document.tempFilename = data.fileName;
        $scope.document.size = data.size;

      }).error(function(data, status, headers, config) {
        console.log(data);

        $scope.uploadError = data;
      });
      //.then(success, error, progress); 
      //.xhr(function(xhr){xhr.upload.addEventListener(...)})// access and attach any event listener to XMLHttpRequest.
    }
    /* alternative way of uploading, send the file binary with the file's content-type.
       Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed. 
       It could also be used to monitor the progress of a normal http post/put request with large data*/
    // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
  };


  // ------------------------------------------------------------------------
  // validation
  // ------------------------------------------------------------------------




}]);