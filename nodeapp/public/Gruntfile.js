// Generated on 2014-01-03 using generator-jhipster 0.6.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({
    base: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'app/dist'
    },
    autoprefixer: {
      options: ['last 1 version'],
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= base.dist %>/*',
            '!<%= base.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    // not used since Uglify task does concat,
    // but still available if needed
    /*concat: {
      dist: {}
    },*/
    rev: {
      dist: {
        files: {
          src: [
            '<%= base.dist %>/scripts/{,*/}*.js',
            '<%= base.dist %>/styles/{,*/}*.css',
            '<%= base.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= base.dist %>/fonts/*'
          ]
        }
      }
    },
    useminPrepare: {
      html: 'app/index.html',
      options: {
        dest: '<%= base.dist %>'
      }
    },
    usemin: {
      html: ['<%= base.dist %>/{,*/}*.html'],
      css: ['<%= base.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= base.dist %>']
      }
    },
    cssmin: {
      // By default, your `index.html` <!-- Usemin Block --> will take care of
      // minification. This option is pre-configured if you do not wish to use
      // Usemin blocks.
      // dist: {
      //   files: {
      //     '<%= base.dist %>/styles/main.css': [
      //       'bootstrap.css',
      //       'flags-sprite.css',
      //       'datepicker.css',
      //       'font-awesome.min.css',
      //       '.tmp/styles/{,*/}*.css',
      //       'styles/{,*/}*.css'
      //     ]
      //   }
      // }
    },
    htmlmin: {
      dist: {
        options: {
          /*removeCommentsFromCDATA: true,
          // https://github.com/base/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: 'app',
          src: ['*.html', 'app/views/*.html'],
          dest: '<%= base.dist %>'
        }]
      }
    },
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'app',
          dest: '<%= base.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'images/{,*/}*.{gif,webp}',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= base.dist %>/images',
          src: [
            'generated/*'
          ]
        }]
      },
      styles: {
        files: [
          {
            expand: true,
            cwd: 'app/styles',
            dest: '.tmp/styles/',
            src: '{,*/}*.css'
          },
          {
            expand: true,
            cwd: 'app/bower_components/bootstrap/dist/css',
            dest: '.tmp/bower_components/bootstrap/dist/css',
            src: 'bootstrap.css'
          },
          {
            expand: true,
            cwd: 'app/bower_components/bootstrap-datepicker/css',
            dest: '.tmp/bower_components/bootstrap-datepicker/css',
            src: 'datepicker.css'
          },
          {
            expand: true,
            cwd: 'app/bower_components/famfamfam-flags-sprite/src',
            dest: '.tmp/bower_components/famfamfam-flags-sprite/src',
            src: 'flags-sprite.css'
          },
          {
            expand: true,
            cwd: 'app/bower_components/font-awesome/css',
            dest: '.tmp/bower_components/font-awesome/css',
            src: 'font-awesome.min.css'
          },
          {
            expand: true,
            cwd: 'app/bower_components/angular-loading-bar/build',
            dest: '.tmp/bower_components/angular-loading-bar/build',
            src: 'loading-bar.css'
          },
          {
            expand: true,
            cwd: 'app/bower_components/selectize/dist/css',
            dest: '.tmp/bower_components/selectize/dist/css',
            src: 'selectize.bootstrap3.css'
          },
          {
            expand: true,
            cwd: 'app/bower_components/bootstrap-switch/dist/css/bootstrap3',
            dest: '.tmp/bower_components/bootstrap-switch/dist/css/bootstrap3',
            src: 'bootstrap-switch.css'
          }
        ]
      },
      fonts: {
        files: [
          {
            expand: true,
            cwd: 'app/bower_components/bootstrap/dist/fonts/',
            dest: '<%= base.dist %>/fonts',
            src: '{,*/}*.*'
          },
          {
            expand: true,
            cwd: 'app/bower_components/font-awesome/fonts/',
            dest: '<%= base.dist %>/fonts',
            src: '{,*/}*.*'
          }
        ]
      },
      i18n: {
        files: [
          {
            expand: true,
            cwd: 'app/i18n',
            dest: '<%= base.dist %>/i18n',
            src: '{,*/}*.json'
          },
        ]
      },
      images: {
        files: [
          {
            expand: true,
            cwd: 'app/images',
            dest: '<%= base.dist %>/images',
            src: '{,*/}*.jpg'
          },
        ]
      },
      views: {
        files: [
          {
            expand: true,
            cwd: 'app/views',
            dest: '<%= base.dist %>/views',
            src: '{,*/}*.html'
          },
        ]
      },
      images4styles: {
        files: [
          {
            expand: true,
            cwd: 'app/bower_components/famfamfam-flags-sprite/src',
            dest: '<%= base.dist %>/styles',
            src: '{,*/}*.png'
          },
        ]
      }
    },
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles',
        'htmlmin',
        'copy:fonts',
        'copy:i18n',
        'copy:views',
        'copy:images',
        'copy:images4styles'
      ]
    },
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= base.dist %>/scripts/scripts.js': [
            '<%= base.dist %>/scripts/scripts.js'
          ]
        }
      }
    }
  });

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'copy:dist',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
