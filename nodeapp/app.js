/**
 * Module dependencies.
 */

'use strict';

var http = require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('cookie-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer  = require('multer');
var csrf = require('csurf');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var routes = require('./app/routes');
var apiRoutes = require('./app/routes/api');
var authRoutes = require('./app/routes/auth');
var driveRoutes = require('./app/routes/drive');
var config = require('./app/config/application');
var google = require('./app/config/google');
var database = require('./app/config/database');
var SecurityService = require('./app/services/securityService');

var app = express();
var env = app.get('env') || 'development';


// --------------------------------------------------------------------------
// Passport setup
// --------------------------------------------------------------------------
var secService = new SecurityService();

passport.serializeUser(secService.serializeUser);
passport.deserializeUser(secService.deserializeUser);
passport.use(new GoogleStrategy({
    clientID: google.CLIENT_ID,
    clientSecret: google.CLIENT_SECRET,
    callbackURL: google.RETURN_URL
  },
  secService.findOAuthUser
));


// --------------------------------------------------------------------------
// Application setup
// --------------------------------------------------------------------------

// server settings
app.set('port', process.env.PORT || 3000);
app.set('host', process.env.HOST || '127.0.0.1');

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({name: 'mydms', secret: config.application.secret}));
app.use(flash());
app.use(cookieParser(config.application.secret));
app.use(passport.initialize());
app.use(passport.session());
app.use(csrf());
app.use(multer({ dest: path.join(__dirname, 'tmp') }));

if(env === 'development') {
  app.use('/static/', express.static(path.join(__dirname, 'public/app'), {maxAge: '5d'}));
  app.use(favicon(__dirname + '/public/app/html5.ico'));
} else if(env === 'production') {
  app.use('/static', express.static(path.join(__dirname, 'public/app/dist'), {maxAge: '5d'}));
  app.use(favicon(__dirname + '/public/app/dist/html5.ico'));
}
app.disable('x-powered-by');
app.enable('trust proxy');

// view settings
app.locals.basePath = config.application.basePath;

// --------------------------------------------------------------------------
// Mongoose connection handling
// --------------------------------------------------------------------------

var uristring = process.env.MONGODB || database.uri;
mongoose.connect(uristring, database.options);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + uristring);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected!');

  // try each 15seconds to reestablish a connection
  setTimeout(function() {
    console.log('Re-Open a Mongoose connection!');
    mongoose.connect(uristring);
  }, 15000);
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

// --------------------------------------------------------------------------
// CSRF handling with angular
// --------------------------------------------------------------------------

app.use(function(req, res, next) {

  if(!req.session.currentToken) {
    var csrfToken = req.csrfToken();
    res.cookie('XSRF-TOKEN', csrfToken);
    req.session.currentToken = csrfToken;
  }
  next();
});

// --------------------------------------------------------------------------
// Route handling
// --------------------------------------------------------------------------

app.use('/auth', authRoutes);
app.use('/api', secService.authRequired, apiRoutes);
app.use('/drive', secService.authRequired, driveRoutes);
app.use('/', secService.authRequired, routes);

// --------------------------------------------------------------------------
// Error handling
// --------------------------------------------------------------------------

// development error handler
// will print stacktrace
if (env === 'development') {
  app.enable('error-stack'); // display the error stack in development

  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('500', {
      message: err.message,
      error: err,
      title: 'error'
    });
  });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('500', {
      message: err.message,
      error: {},
      title: 'error'
    });
  });
}

// 404 handler with content type specific results
app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

// --------------------------------------------------------------------------
// finally the HTTP server
// --------------------------------------------------------------------------

http.createServer(app).listen(app.get('port'), app.get('host'),  function(){
  console.log('node.js is run in mode ' + env);
  console.log('Express listening on ' + app.get('host') + ':' + app.get('port'));
});
