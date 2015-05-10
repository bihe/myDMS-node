(function() {
  'use strict';

  angular
    .module('mydmsApp', ['ui.router'
      , 'ngCookies'                         // angular cookie handling
      , 'pascalprecht.translate'            // translate angular elements
      , 'ngFileUpload'                 	    // handel file-upload the angular way
      , 'chieffancypants.loadingBar'        // loading indicator for xhr requests
      , 'hb.infiniScroll'                   // infinite scrolling plugin
      , 'mgcrea.ngStrap'                    // bootstrap directives: modal
      , 'mydms.main'
      , 'mydms.document'
      , 'mydms.settings'
      , 'mydms.ui'

    ])
    .constant('_', window._)
    .constant('moment', window.moment)
    .config(['$stateProvider'
      , '$urlRouterProvider'
      , '$compileProvider'
      , '$translateProvider'
      , function ($stateProvider
        , $urlRouterProvider
        , $compileProvider
        , $translateProvider
        ) {
          //
          // for any unmatched url, redirect to /state1
          $urlRouterProvider.otherwise('/');

          //
          // defined states
          $stateProvider
          .state('initial', {
            url: '/',
            templateUrl: 'views/main.html',
            controller: 'MainController',
            controllerAs: 'vm'
          })
          .state('documentAdd', {
            url: '/document/add',
            templateUrl: 'views/document.html',
            controller: 'DocumentController',
            controllerAs: 'vm'
          })
          .state('documentId', {
            url: '/document/:documentId',
            templateUrl: 'views/document.html',
            controller: 'DocumentController',
            controllerAs: 'vm'
          })
          .state('settings', {
            url: '/settings',
            templateUrl: 'views/settings.html',
            controller: 'SettingsController',
            controllerAs: 'vm'
          })
          .state('settingsConnection', {
            url: '/settings/:connection',
            templateUrl: 'views/settings.html',
            controller: 'SettingsController',
            controllerAs: 'vm'
          })
          ;

          //
          // Initialize angular-translate
          $translateProvider.useStaticFilesLoader({
              prefix: './i18n/',
              suffix: '.json'
          });

          $translateProvider.preferredLanguage('de');

          // remember language
          $translateProvider.useCookieStorage();

          // sanitize
          $translateProvider.useSanitizeValueStrategy('escaped');

          //
          // speedup
          $compileProvider.debugInfoEnabled(false);

        }])
    .run(['$rootScope', '$location',
      function($rootScope, $location) {
        $rootScope.$on('$routeChangeStart', function(event, next, current) {

        });
      }]);
})();
