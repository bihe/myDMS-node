'use strict';

/* Directives */


angular.module('myDMS.directives', []).
  directive('appVersion', ['versionService', function(versionService) {
    return function(scope, elm, attrs) {
      versionService.version(function(data) {
				elm.text(data);
      });
    };
  }]);
