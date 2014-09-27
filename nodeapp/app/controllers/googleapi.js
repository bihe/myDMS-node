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
 * url: /drive/connect
 * first step of the oauth login logic for google
 */
exports.connect = function(req, res, next) {
  var authUrl
    , storageService = new StorageService();
  authUrl = storageService.generateAuthUrl();
  res.redirect(authUrl);
};


/*
 * url: /drive/disconnect
 * disconnect from drive - invalidate the token
 */
exports.disconnect = function(req, res, next) {
  var storageService = new StorageService()
    , userService = new UserService();

  try {

    // get the user-id and retrieve the necessary token
    userService.clearToken(req.user).then(function() {
      return userService.getTokenFromUser(req.user);
    }).then(function(credentials) {
      return storageService.revokeToken(credentials);
    }).then(function(response) {
      res.redirect('/static/#/settings/connection');
    }).catch(function(error) {
      console.log(error);
      // anyway, forward to the settings screen
      res.redirect('/static/#/settings/connection');
      //return base.handleError(req, res, next, error);
    }).done();
  } catch(err) {
    return base.handleError(req, res, next, err);
  }
};


/*
 * url: /drive/return
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
    storageService.exractToken(code).then(function(credentials) {

      return userService.setToken(req.user, credentials);
    }).then(function() {

      res.redirect('/static/#/settings/connection');
    }).catch(function(error) {  

      console.log(error);
      return base.handleError(req, res, next, error);
    }).done();

  } catch(err) {
    return base.handleError(req, res, next, err);
  }
};



/*!
 * only for local DEVELOPMENT
 *

exports.listfiles = function(req, res, next) {
  var userService = new UserService()
    , storageService = new StorageService();

  // get the user-id and retrieve the necessary token
  userService.getTokenFromUser(req.user).then(function(token) {

    return storageService.folderExists('000 testFolder', '0B_XK0TbSeuZUaEhvTjBlZDI0Zmc', token);
  }).then(function(response) {

    console.log(response);
    res.status(200).send(response);
  }).catch(function (err) {

    console.log(err);
    return res.status(500).send('Got an error: ' + err.code + ' / ' + err.message);
  }).done();
};


exports.getfile  = function(req, res, next) {
  var userService = new UserService()
    , storageService = new StorageService()
    ;

  // get the user-id and retrieve the necessary token
  userService.getTokenFromUser(req.user).then(function(token) {

    return storageService.getFile('versicherung.pdf', '0B_XK0TbSeuZUU2J6NnpuRDBIcTA', token);
  }).then(function(response) {

    console.log(response);
    res.status(200).send(response);
  }).catch(function (err) {

    console.log(err);
    return res.status(500).send('Got an error: ' + err.code + ' / ' + err.message);
  }).done();
};


exports.uploadfile  = function(req, res, next) {
  var userService = new UserService()
    , storageService = new StorageService()
    ;

  // get the user-id and retrieve the necessary token
  userService.getTokenFromUser(req.user).then(function(token) {

    return storageService.upload({path: '/home/henrik/tmp/test.pdf', name: 'test.pdf', mimeType: 'application/pdf'}, '0B_XK0TbSeuZUU2J6NnpuRDBIcTA', token);
  }).then(function(response) {

    console.log(response);
    res.status(200).send(response);
  }).catch(function (err) {

    console.log(err);
    return res.status(500).send('Got an error: ' + err.code + ' / ' + err.message);
  }).done();
};


*
*/