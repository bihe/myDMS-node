/*
 * handle documents interaction
 */
'use strict';

var base = require('./base');
var logger = require('../util/logger' );
var utils = require('../util/utils' );
var config = require('../config/application');
var StorageService = require('../services/storageService');
var UserService = require('../services/userService');

/*
 * url: /oauth/connect
 * first step of the oauth login logic for google
 */
exports.connect = function(req, res, next) {
  var authUrl
    , storageService = new StorageService();
  authUrl = storageService.generateAuthUrl();
  res.redirect(authUrl);
};

/*
 * url: /oauth/callback
 * second step of the oauth login logic for google
 */
exports.callback = function(req, res, next) {
  var code = req.query.code
    , token = ''
    , userService = new UserService()
    , storageService = new StorageService();

  try {
    if(!code || code === '') {
      return res.status(500).send('Empty access token supplied!');
    }

    // get the token and store it with the user
    storageService.getToken(code).then(function(credentials) {

      return userService.setToken(req.user, credentials);
    }).then(function() {

      res.redirect('/static/#/settings/connection');
    }).catch(function(error) {

      console.log(error.stack);
      return base.handleError(req, res, next, error);
    }).done();

  } catch(err) {
    return base.handleError(req, res, next, err);
  }
};

/*
 * url: /oauth/listfiles
 * display files from google drive
 */
exports.listfiles = function(req, res, next) {
  var userService = new UserService()
    , storageService = new StorageService();

  // get the user-id and retrieve the necessary token
  userService.getTokenFromUser(req.user).then(function(token) {

    return storageService.listfiles('title contains \'media_rechnung.pdf\'', token);
  }).then(function(response) {

    console.log(response);
    res.status(200).send(response);
  }).catch(function (err) {

    console.log(err);
    return res.status(500).send('Got an error: ' + err.code + ' / ' + err.message);
  }).done();
};
