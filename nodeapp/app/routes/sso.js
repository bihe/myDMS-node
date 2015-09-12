/*
 * base routes
 * index.js created by Henrik Binggl
 */
'use strict';

var express = require('express');
var router = express.Router();

var baseController = require('../controllers/base');

// setup the routes and delegate logic to the controllers
// --------------------------------------------------------------------------
router.get('/', baseController.token);

module.exports = router;