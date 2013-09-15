'use strict';

/* Services */

var module = angular.module('myDMS.services');
module.factory('tagServiceMock', [function() {
  var tagService = {};

  tagService.getTags = function(success, error) {
		success([
			"Abfertigung", "Abo", "Apple", "Arzt"
		]);
  };

  return tagService;
}]);


module.factory('tagService', ['$http', function($http) {
  var tagService = {};

  tagService.getTags = function(success, error) {
		$http.get('./api/1.0/tags').success(success).error(error);
  };

  return tagService;
}]);