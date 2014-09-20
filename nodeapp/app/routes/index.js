/*
 * base routes
 * index.js created by Henrik Binggl
 */
'use strict';

var express = require('express');
var passport = require('passport');
var router = express.Router();

var baseController = require('../controllers/base');

// setup the routes and delegate logic to the controllers
// --------------------------------------------------------------------------
router.get('/', baseController.index);

module.exports = router;