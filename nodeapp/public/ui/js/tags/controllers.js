'use strict';

/* Controllers */

angular.module('myDMS.controllers').
	controller('TagsCtrl', ['$scope', 'tagServiceMock', function($scope, tagService) {

		tagService.getTags(function(data) {
			$scope.tags = data;
		}, function(data, status, headers) {
			alert('Error: ' + data + '\nHTTP-Status: ' + status);
		});

 	}]
);