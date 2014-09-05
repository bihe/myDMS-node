// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '../..',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'ui/webapp/bower_components/modernizr/modernizr.js',
            'ui/webapp/bower_components/jquery/jquery.js',
            'ui/webapp/bower_components/bootstrap/dist/js/bootstrap.js',
            'ui/webapp/bower_components/bootstrap-datepicker/js/bootstrap-datepicker.js',
            'ui/webapp/bower_components/bootstrap-datepicker/js/locales/bootstrap-datepicker.de.js',
            'ui/webapp/bower_components/angular/angular.js',
            'ui/webapp/bower_components/angular-mocks/angular-mocks.js',
            'ui/webapp/bower_components/angular-route/angular-route.js',
            'ui/webapp/bower_components/angular-resource/angular-resource.js',
            'ui/webapp/bower_components/angular-cookies/angular-cookies.js',
            'ui/webapp/bower_components/angular-sanitize/angular-sanitize.js',
            'ui/webapp/bower_components/angular-translate/angular-translate.js',
            'ui/webapp/bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
            'ui/webapp/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
            'ui/webapp/scripts/*.js',
            'ui/webapp/scripts/**/*.js',
            'ui/tests/spec/**/*.js'
        ],

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 9876,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
