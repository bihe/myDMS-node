/*
 * define the routes to the handling controllers
 * index.js created by Henrik Binggl
 */
'use strict';

var express = require('express');
var router = express.Router();

var baseController = require('../controllers/base');
var tagsController = require('../controllers/tags');
var senderController = require('../controllers/senders');
var documentsController = require('../controllers/documents');
var settingsController = require('../controllers/settings');
var googleApi = require('../controllers/googleapi');
var API = require('../config/version').api;

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

router.get('/oauth/connect', googleApi.connect);
router.get('/oauth/callback', googleApi.callback);
router.get('/listfiles', googleApi.listfiles);

module.exports = router;
