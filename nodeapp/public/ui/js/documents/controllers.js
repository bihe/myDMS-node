'use strict';

/* Controllers */

angular.module('myDMS.controllers').
	controller('DocCtrl', ['$scope', 'documentServiceMock', function($scope, docService) {
		docService.getDocuments(function(data) {
			$scope.documents = data;
		}, function(data, status, headers) {
			alert('Error: ' + data + '\nHTTP-Status: ' + status);
		});

	}]);