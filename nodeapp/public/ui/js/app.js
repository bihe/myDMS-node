'use strict';


// Declare app level module which depends on filters, and services
angular.module('myDMS', ['ngRoute', 'myDMS.services', 'myDMS.directives', 'myDMS.controllers', 'myDMS.filters']).
  config(['$routeProvider', function($routeProvider) {
  	$routeProvider.when('/documents', {templateUrl: '/ui/partials/documents.html', controller: 'DocCtrl'});
    $routeProvider.when('/view1', {templateUrl: '/ui/partials/partial1.html', controller: 'MyCtrl1'});
    $routeProvider.when('/view2', {templateUrl: '/ui/partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/documents'});
  }]);
