'use strict';

var module = angular.module('myDMS.services', []);
module.factory('versionService', ['$http', function($http) {
  var versionService = {};

  versionService.version = function(success) {
  	$http.get('./api/1.0/version').success(success).
	  error(function(data, status) {
	    window.alert('Error: could not get version!\n' + data + ' / ' + status);
	  });
	};

  return versionService;
}]);