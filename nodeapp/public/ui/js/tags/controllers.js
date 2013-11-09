'use strict';

/* Controllers */

angular.module('myDMS.controllers').
	controller('TagsCtrl', ['$scope', 'tagService', function($scope, tagService) {

		tagService.getTags(function(data) {
			$scope.tags = data;
		}, function(data, status, headers) {
			alert('Error: ' + data + '\nHTTP-Status: ' + status);
		});

 	}]
);