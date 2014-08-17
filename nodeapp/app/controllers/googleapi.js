/*
 * handle documents interaction
 */
'use strict';

var base = require('./base');
var logger = require('../util/logger' );
var utils = require('../util/utils' );
var config = require('../config/application');
var googleConfig = require('../config/google');

var googleapis = require('googleapis');
var OAuth2 = googleapis.auth.OAuth2;
var oauth2Client = new OAuth2(googleConfig.CLIENT_ID, googleConfig.CLIENT_SECRET, googleConfig.redirectUrl);
var drive = googleapis.drive({ version: 'v2' });

/*
 * url: /oauth/login
 * first step of the oauth login logic for google
 */
exports.login = function(req, res, next) {
  var authUrl;
  authUrl = oauth2Client.generateAuthUrl({ scope: googleConfig.SCOPE });
  res.redirect(authUrl);
};

/*
 * url: /oauth/callback
 * second step of the oauth login logic for google
 */
exports.callback = function(req, res, next) {
  var code = req.query.code;
  try {
    if(!code || code === '') {
      return res.status(500).send('Empty access token supplied!');
    }

    // request access token
    oauth2Client.getToken(code, function(err, tokens) {
      try {
        console.log(tokens);
        oauth2Client.setCredentials(tokens);
        res.redirect('/listfiles');
      } catch(error) {
        console.log(error);
        return base.handleError(req, res, next, error);
      }
      
    });
  } catch(err) {
    return base.handleError(req, res, next, err);
  }
};

/*
 * url: /listfiles
 * display files from google drive
 */
exports.listfiles = function(req, res, next) {
  try {
    drive.files.list({ 
      corpus: 'DEFAULT',
      'q': 'title contains \'media_rechnung.pdf\'',
      auth: oauth2Client 
    }, function(err, response) {
      if(err) {
        console.log(err);
        return res.status(500).send('Got an error: ' + err.code + ' / ' + err.message);
      }
      console.log(response);
      res.status(200).send(response);
    });
  } catch(err) {
    return base.handleError(req, res, next, err);
  }
}