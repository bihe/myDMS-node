/*
 * basic controller logic to display the different templates
 * base.js created by Henrik Binggl
 */
'use strict';

var version = require('../config/version')
  , UserService = require('../services/userService');

// the index path just redirects to /static
exports.index = function(req, res) {
  res.redirect('/static');
};

// return the current version as plain/text
exports.version = function(req, res) {
	res.write(version.number);
	res.end();
};

exports.logout = function(req, res) {
  // todo: clear the cookie
  // redirect
  res.redirect('/');
};

/**
 * get user profile
 * @param req
 * @param res
 */
exports.user = function(req, res) {
  if(req.session.user) {
    return res.json(req.session.user);
  }
  return res.status(400).send('Cannot find user!');
};

// common error handle
exports.handleError = function( req, res, next, err ) {
  console.error('An error occured: ' + err.message);
  console.error('Stack: ' + err.stack);

  return next(err);
};