'use strict';

/* Controllers */

angular.module('myDMS.controllers').
	controller('TagsCtrl', ['$scope', function($scope) {

		$scope.tags = [
	    {text:'Haus'},
	    {text:'Family'}
	  ];

 	}]
);