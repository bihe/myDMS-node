/*
 * routes for the backend service with Google drive
 * drive.js created by Henrik Binggl
 */
'use strict';

var express = require('express');
var router = express.Router();

var googleApi = require('../controllers/googleapi');

router.get('/listfiles', googleApi.listfiles);

module.exports = router;