/*jslint node: true */

/**
 * Module dependencies.
 */
'use strict';

var express = require('express');
var cons = require('consolidate');
var http = require('http');
var path = require('path');
var routes = require('./app/routes');
var config = require('./app/config/application');

var app = express();

app.configure(function(){
  // assign the mustache engine to .html files
  app.engine('html', cons.mustache);

  app.set('port', process.env.PORT || 3000);
  app.set('host', '127.0.0.1');
  app.set('views', __dirname + '/app/views');
  app.set('view engine', 'html');

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.application.secret));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public/webapp')));
});

// pretty HTML formating for output
app.locals.pretty = true;

app.configure('development', function(){
  app.use(express.errorHandler());
});

routes.setup(app);

http.createServer(app).listen(app.get('port'), app.get('host'),  function(){
  console.log('node.js is run in mode ' + process.env.NODE_ENV);
  console.log('Express server listening on port ' + app.get('port'));
});
