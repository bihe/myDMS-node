'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.initConfig({
    base: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'ui/dist'
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
      html: 'ui/index.html',
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
          cwd: 'ui',
          src: ['*.html', 'views/*.html'],
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
          cwd: 'ui',
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
            cwd: 'ui/styles',
            dest: '.tmp/styles/',
            src: '{,*/}*.css'
          },
          {
            expand: true,
            cwd: 'ui/bower_components/bootstrap/dist/css',
            dest: '.tmp/bower_components/bootstrap/dist/css',
            src: 'bootstrap.css'
          },
          {
            expand: true,
            cwd: 'ui/bower_components/bootstrap-datepicker/dist/css',
            dest: '.tmp/bower_components/bootstrap-datepicker/dist/css',
            src: 'datepicker.css'
          },
          {
            expand: true,
            cwd: 'ui/bower_components/famfamfam-flags-sprite/src',
            dest: '.tmp/bower_components/famfamfam-flags-sprite/src',
            src: 'flags-sprite.css'
          },
          {
            expand: true,
            cwd: 'ui/bower_components/font-awesome/css',
            dest: '.tmp/bower_components/font-awesome/css',
            src: 'font-awesome.min.css'
          },
          {
            expand: true,
            cwd: 'ui/bower_components/angular-loading-bar/build',
            dest: '.tmp/bower_components/angular-loading-bar/build',
            src: 'loading-bar.css'
          },
          {
            expand: true,
            cwd: 'ui/bower_components/selectize/dist/css',
            dest: '.tmp/bower_components/selectize/dist/css',
            src: 'selectize.bootstrap3.css'
          }
        ]
      },
      fonts: {
        files: [
          {
            expand: true,
            cwd: 'ui/bower_components/bootstrap/dist/fonts/',
            dest: '<%= base.dist %>/fonts',
            src: '{,*/}*.*'
          },
          {
            expand: true,
            cwd: 'ui/bower_components/font-awesome/fonts/',
            dest: '<%= base.dist %>/fonts',
            src: '{,*/}*.*'
          }
        ]
      },
      images: {
        files: [
          {
            expand: true,
            cwd: 'ui/images',
            dest: '<%= base.dist %>/images',
            src: '{,*/}*.*'
          },
        ]
      },
      views: {
        files: [
          {
            expand: true,
            cwd: 'ui/views',
            dest: '<%= base.dist %>/views',
            src: '{,*/}*.html'
          },
        ]
      },
      i18n: {
        files: [
          {
            expand: true,
            cwd: 'ui/i18n',
            dest: '<%= base.dist %>/i18n',
            src: '{,*/}*.json'
          },
        ]
      }
    },
    concurrent: {
      dist: [
        'copy:styles',
        'htmlmin',
        'copy:fonts',
        'copy:views',
        'copy:images',
        'copy:i18n',
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
    },
    // gzip assets 1-to-1 for production
    compress: {
      main: {
        options: {
          archive: 'ui-dist.zip'
        },
        expand: true,
        cwd: 'ui/dist/',
        src: ['**/*'],
        dest: './'
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
    'usemin',
    'compress'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
