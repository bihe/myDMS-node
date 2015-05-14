(function() {
  'use strict';

  // module
  angular
    .module('mydms.document')
    .controller('DocumentController', ['backendService'
      , '$location'
      , '$stateParams'
      , '_'
      , 'Upload'
      , '$timeout'
      , '$rootScope'
      , documentController
    ])
    ;

  /*
   * handle the documents
   */
  function documentController(backendService
    , $location
    , $stateParams
    , _
    , Upload
    , $timeout
    , $rootScope) {

    var vm = this;


    init();
    load();



    //////////////////


    /**
     * setup environment
     */
    function init() {
      vm.saveSuccess = null;
      vm.saveErrorMessage = null;
      vm.uploadError = null;
      vm.formValidationError = false;
      vm.document = {};
      vm.document._id = -1;
      vm.document.title = '';
      vm.document.fileName = '';
      vm.document.amount = null;
      vm.document.modified = null;
      vm.document.created = null;
      vm.document.senders = [];
      vm.document.tags = [];

      if($stateParams && $stateParams.documentId) {
        vm.document._id = $stateParams.documentId;
      }
    }

    /**
     * startup - fetch remote data
     */
     function load() {
      if(vm.document._id !== -1) {
        backendService.getDocumentById(vm.document._id).success(function(data) {

          // got the data - preset the selection
          vm.document.title = data.title;
          vm.document.fileName = data.fileName;
          vm.document.amount = data.amount;
          vm.document.senders = data.senders;
          vm.document.tags = data.tags;
          vm.document.modified = data.modified;
          vm.document.created = data.created;

          vm.selectedSenders = data.senders;
          vm.selectedTags = data.tags;

        })
        .error( function(data, status, headers) {

            if(status === 403) {
              $rootScope.$emit('::authError::');
              return;
            }

            alert('Error: ' + data + '\nHTTP-Status: ' + status);
            return $location.path('/');


        });
      } else {
        vm.selectedSenders = [];
        vm.selectedTags = [];
      }

    }


    //////////////////
    // actions
    //////////////////

    // navigate back to main screen
    vm.cancel = function(path) {
      $location.path(path);
    };

    // delete the given document
    vm.delete = function() {
      vm.saveErrorMessage = null;

      backendService.deleteDocument(vm.document._id).success(function() {
        $timeout(function() {
          $location.path('/');
        }, 750);
      }).error( function(data, status, headers) {
        vm.saveSuccess = false;
        vm.saveErrorMessage = data;

        if(status === 403) {
          $rootScope.$emit('::authError::');
          return;
        }
      });
    };

    // save the document
    vm.save = function(valid) {
      var postData;

      vm.formValidationError = false;
      if(!valid) {
        vm.formValidationError = true;
        return;
      }

      vm.document.tags = vm.selectedTags;
      vm.document.senders = vm.selectedSenders;

      vm.saveSuccess = null;
      vm.saveErrorMessage = null;

      postData = JSON.stringify(vm.document);
      // either this is an update or we need to create a new entry
      // it's dependant on the availability of a document-id
      if(vm.document._id !== -1) {
        // PUT
        // update existing entry
        backendService.updateDocument(postData).success(function (data, status, headers, config) {
          vm.saveSuccess = true;

          $location.path('/');
        }).error(function (data, status, headers, config) {
          vm.saveSuccess = false;
          vm.saveErrorMessage = data;

          if(status === 403) {
            $rootScope.$emit('::authError::');
            return;
          }
        });
      } else {
        // POST
        // create a new entry
        backendService.createDocument(postData).success(function (data, status, headers, config) {
          vm.saveSuccess = true;

          $location.path('/');
        }).error(function (data, status, headers, config) {
          vm.saveSuccess = false;
          vm.saveErrorMessage = data;

          if(status === 403) {
            $rootScope.$emit('::authError::');
            return;
          }
        });
      }

    };

    // ------------------------------------------------------------------------
    // file upload logic using angular-file-upload.js
    // ------------------------------------------------------------------------

    vm.onFileSelect = function($files) {
      vm.uploadError = null;
      vm.document.tempFilename = null;
      vm.document.size = null;

      //$files: an array of files selected, each file has name, size, and type.
      for (var i = 0; i < $files.length; i++) {
        var file = $files[i];
        vm.upload = Upload.upload({
          url: '/api/1.0/document/upload', //upload.php script, node.js route, or servlet url
          // method: POST or PUT,
          // headers: {'header-key': 'header-value'},
          // withCredentials: true,
          data: { myObj: vm.myModelObj },
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
          vm.document.fileName = data.originalFileName;
          vm.document.contentType = data.contentType;
          vm.document.tempFilename = data.fileName;
          vm.document.size = data.size;

        }).error(function(data, status, headers, config) {
          console.log(data);
          vm.uploadError = data;

          if(status === 403) {
            $rootScope.$emit('::authError::');
            return;
          }
        });
        //.then(success, error, progress);
        //.xhr(function(xhr){xhr.upload.addEventListener(...)})// access and attach any event listener to XMLHttpRequest.
      }
      /* alternative way of uploading, send the file binary with the file's content-type.
         Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed.
         It could also be used to monitor the progress of a normal http post/put request with large data*/
      // vm.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
    };



  }

})();
