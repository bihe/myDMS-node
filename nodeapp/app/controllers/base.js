/*
 * basic controller logic to display the different templates
 * base.js created by Henrik Binggl
 */
'use strict';

var version = require('../config/version');

// the index path just redirects to /static
exports.index = function(req, res) {
  res.redirect('/static');
};

// the index path - render the mustache template
exports.login = function(req, res) {
  res.locals.errors = req.flash();
  console.log(res.locals.errors);
  res.render('login', { messages: res.locals.errors });
};

// return the current version as plain/text
exports.version = function(req, res) {
	res.write(version.number);
	res.end();
};

// common error handle
exports.handleError = function( req, res, next, err ) {
  console.error('An error occured: ' + err.message);
  console.error('Stack: ' + err.stack);

  return next(err);
};