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

// the index path - render the mustache template
exports.login = function(req, res) {
  res.locals.errors = req.flash();
  console.log(res.locals.errors);
  res.render('login', { messages: res.locals.errors });
};

// logout the current user
exports.logout = function(req, res) {
  var result = {};
  result.success = true;
  try {
    req.logout();
  } catch(error) {
    result.success = false;
    result.error = error;
  }
  res.json(result);
};

// return the current version as plain/text
exports.version = function(req, res) {
	res.write(version.number);
	res.end();
};

// retrieve the user
exports.user = function(req, res) {
  var userService = new UserService();
  userService.findUserById(req.user).then(function(user) {
    var viewModel = {};
    viewModel.hasToken = false;
    if(user.token && user.token !== '' && user.tokenDate) {
      viewModel.hasToken = true;
    }
    viewModel.thumb = user.thumb;
    viewModel.displayName = user.displayName;
    viewModel.email = user.email;

    res.json(viewModel);
  }).catch(function(error) {

    console.log(error.stack);
    return res.status(400).send('Cannot find user! ' + error);
  }).done();
};

// common error handle
exports.handleError = function( req, res, next, err ) {
  console.error('An error occured: ' + err.message);
  console.error('Stack: ' + err.stack);

  return next(err);
};