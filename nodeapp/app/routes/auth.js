/*
 * routes used for authentication
 * auth.js created by Henrik Binggl
 */
'use strict';

var express = require('express');
var passport = require('passport');
var router = express.Router();

var baseController = require('../controllers/base');
var google = require('../config/google');

// setup the routes and delegate logic to the controllers
// --------------------------------------------------------------------------
router.get('/login', baseController.login);

// GET /google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve redirecting
//   the user to google.com.  After authenticating, Google will redirect the
//   user back to this application at /auth/google/return
router.get('/google', passport.authenticate('google', { scope: google.SCOPE, accessType: 'offline' /*, approvalPrompt: 'force' */}));

// GET /google/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/google/return',
  passport.authenticate('google', { failureRedirect: '/auth/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/static');
  });

module.exports = router;
