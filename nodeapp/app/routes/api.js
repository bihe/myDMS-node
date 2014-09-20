/*
 * define the routes to the handling controllers
 * api.js created by Henrik Binggl
 */
'use strict';

var express = require('express');
var router = express.Router();

var baseController = require('../controllers/base');
var tagsController = require('../controllers/tags');
var senderController = require('../controllers/senders');
var documentsController = require('../controllers/documents');
var settingsController = require('../controllers/settings');
var API = require('../config/version').api;


// setup the routes and delegate logic to the controllers
// --------------------------------------------------------------------------

router.get('/' + API + '/version', baseController.version);
router.get('/' + API + '/tags', tagsController.index);
router.get('/' + API + '/senders', senderController.index);
router.get('/' + API + '/documents', documentsController.index);
router.get('/' + API + '/document/:id', documentsController.document);
router.get('/' + API + '/document/download/:id', documentsController.documentDownload);
router.post('/' + API + '/document/', documentsController.saveDocument);
router.put('/' + API + '/document/', documentsController.saveDocument);
router.post('/' + API + '/document/upload', documentsController.upload);
router.delete('/' + API + '/document/:id', documentsController.deleteDocument);
router.post('/' + API + '/settings', settingsController.save);
router.get('/' + API + '/user', baseController.user);
router.post('/' + API + '/user/logout', baseController.logout);

module.exports = router;
