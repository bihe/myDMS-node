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
var randomstring = require('randomstring');
var storageService = new StorageService();
var oauthCredentials;

/*
 * url: /oauth/connect
 * first step of the oauth login logic for google
 */
exports.connect = function(req, res, next) {
  var authUrl;
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
    , tokenParam = '';

  try {
    if(!code || code === '') {
      return res.status(500).send('Empty access token supplied!');
    }

    storageService.getToken(code).then(function(credentials) {
      oauthCredentials = credentials;

      token = randomstring.generate(16);
      userService.setToken('540a09000de52f5b129f23d0', token).then(function() {

        tokenParam = new Buffer(token).toString('base64');

        res.redirect('/#/settings/connection/' + tokenParam);
      }).catch(function(error) {
        console.log(error.stack);
        return base.handleError(req, res, next, error);
      }).done();


    }).catch(function(error) {
      console.log(error);
      return base.handleError(req, res, next, error);
    }).done();

  } catch(err) {
    return base.handleError(req, res, next, err);
  }
};

/*
 * url: /listfiles
 * display files from google drive
 */
exports.listfiles = function(req, res, next) {
  storageService.listfiles('title contains \'media_rechnung.pdf\'', oauthCredentials).then(function (response) {
    console.log(response);
    res.status(200).send(response);
  }).catch(function (err) {
    console.log(err);
    return res.status(500).send('Got an error: ' + err.code + ' / ' + err.message);
  }).done();
};
