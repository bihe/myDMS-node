/*
 * basic controller logic to display the different templates
 * base.js created by Henrik Binggl
 */
'use strict';

var version = require('../config/version')
  , UserService = require('../services/userService');

// handle the jwt token 
exports.token = function(req, res) {
  var token = req.query.token;
  if(!token) {
    console.log('No token supplied!');
    return res.status(400).send('No token supplied in request!');
  }
  
  res.redirect('/static');
};

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