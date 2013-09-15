'use strict';

/* Services */

var module = angular.module('myDMS.services');
module.factory('documentServiceMock', [function() {
  var documentService = {};

  documentService.getDocuments = function(success, error) {
		success([
			'Dok1', 'Dok1', 'Dok1', 'Dok1','Dok1', 'Dok1', 'Dok1', 'Dok1','Dok1', 'Dok1', 'Dok1', 'Dok1','Dok1', 'Dok1', 'Dok1', 'Dok1'
		]);
  };

  return documentService;
}]);