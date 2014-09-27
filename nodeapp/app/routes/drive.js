/*
 * routes for the backend service with Google drive
 * drive.js created by Henrik Binggl
 */
'use strict';

var express = require('express');
var router = express.Router();

var googleApi = require('../controllers/googleapi');

// oauth interaction
router.get('/connect', googleApi.connect);
router.get('/disconnect', googleApi.disconnect);
router.get('/return', googleApi.callback);

/*!
 * LOVAL DEVELOPMENT 
router.get('/listfiles', googleApi.listfiles);
router.get('/getfile', googleApi.getfile);
router.get('/uploadfile', googleApi.uploadfile);
 */
 
module.exports = router;