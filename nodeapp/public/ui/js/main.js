'use strict';

// load all of the dependencies asynchronously.
$script([
  './ui/lib/angular/angular.js',
  './ui/js/app.js',
  './ui/js/services.js',
  './ui/js/controllers.js',
  './ui/js/directives.js',
  './ui/js/filters.js',

  './ui/js/tags/services.js',     
  './ui/js/tags/controllers.js',
  './ui/js/documents/services.js',     
  './ui/js/documents/controllers.js'
], function() {
  // when all is done, execute bootstrap angular application
  angular.bootstrap(document, ['myDMS']);
});