/*jslint node: true */

/**
 * Module dependencies.
 */
'use strict';

var express = require('express');
var cons = require('consolidate');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var routes = require('./app/routes');
var config = require('./app/config/application');
var database = require('./app/config/database');

var app = express();

app.configure(function(){
  app.set('view engine', 'jade');

  app.set('port', process.env.PORT || 3000);
  app.set('host', '127.0.0.1');
  app.set('views', __dirname + '/app/views');
  
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.application.secret));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public/webapp')));
});

// the following snippets of code was found here:
// http://runnable.com/UTlPPV-f2W1TAAEf/custom-error-pages-in-express-for-node-js

// error-handling middleware, take the same form
// as regular middleware, however they require an
// arity of 4, aka the signature (err, req, res, next).
// when connect has an error, it will invoke ONLY error-handling
// middleware.

// If we were to next() here any remaining non-error-handling
// middleware would then be executed, or if we next(err) to
// continue passing the error, only error-handling middleware
// would remain being executed, however here
// we simply respond with an error page.

// define some settings
app.locals.basePath = config.application.basePath;
app.enable(config.errorDetails);

app.use(function(err, req, res, next){
  // we may use properties of the error object
  // here and next(err) appropriately, or if
  // we possibly recovered from the error, simply next().
  res.status(err.status || 500);
  res.render('500', { error: err });
});

// Since this is the last non-error-handling
// middleware use()d, we assume 404, as nothing else
// responded.

// $ curl http://localhost:3000/notfound
// $ curl http://localhost:3000/notfound -H "Accept: application/json"
// $ curl http://localhost:3000/notfound -H "Accept: text/plain"

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


var uristring = database.uri;
mongoose.connect(uristring, function (err) {
  if (err) {
    console.log('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log('Succeeded connected to: ' + uristring);
  }
});

// pretty HTML formating for output
app.locals.pretty = true;

app.configure('development', function(){
  app.use(express.errorHandler());

  // test the custom error page
  app.get('/500', function(req, res, next){
    // trigger a generic (500) error
    next(new Error('keyboard cat!'));
  });

  // test a 404 response
  app.get('/404', function(req, res, next){
    // trigger a 404 since no other middleware
    // will match /404 after this one, and we're not
    // responding here
    next();
  });

});




routes.setup(app);


http.createServer(app).listen(app.get('port'), app.get('host'),  function(){
  console.log('node.js is run in mode ' + process.env.NODE_ENV);
  console.log('Express server listening on port ' + app.get('port'));
});
