/*
 * define the routes to the handling controllers
 * index.js created by Henrik Binggl
 */
'use strict';

var express = require('express');
var passport = require('passport');
var router = express.Router();

var SecurityService = require('../services/securityService');
var baseController = require('../controllers/base');
var tagsController = require('../controllers/tags');
var senderController = require('../controllers/senders');
var documentsController = require('../controllers/documents');
var settingsController = require('../controllers/settings');
var googleApi = require('../controllers/googleapi');
var API = require('../config/version').api;

var secService = new SecurityService();

// setup the routes and delegate logic to the controllers
// --------------------------------------------------------------------------

router.get('/api/' + API + '/version', baseController.version);
router.get('/api/' + API + '/tags', tagsController.index);
router.get('/api/' + API + '/senders', senderController.index);
router.get('/api/' + API + '/documents', documentsController.index);
router.get('/api/' + API + '/document/:id', documentsController.document);
router.get('/api/' + API + '/document/download/:id', documentsController.documentDownload);
router.post('/api/' + API + '/document/', documentsController.saveDocument);
router.put('/api/' + API + '/document/', documentsController.saveDocument);
router.post('/api/' + API + '/document/upload', documentsController.upload);
router.delete('/api/' + API + '/document/:id', documentsController.deleteDocument);
router.post('/api/' + API + '/settings', settingsController.save);

// oauth for google account
router.get('/oauth/connect', googleApi.connect);
router.get('/oauth/callback', googleApi.callback);

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve redirecting
//   the user to google.com.  After authenticating, Google will redirect the
//   user back to this application at /auth/google/return
router.get('/auth/google',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

// GET /auth/google/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/auth/google/return',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


router.get('/login', baseController.index);
router.get('/listfiles', secService.authRequired, googleApi.listfiles);

module.exports = router;
