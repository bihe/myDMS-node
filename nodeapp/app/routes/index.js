/*
 * define the routes to the handling controllers
 * index.js created by Henrik Binggl
 */
'use strict';

var baseController = require('../controllers/base');
var tagsController = require('../controllers/tags');
var documentsController = require('../controllers/documents');
var API = require('../config/version').api;

// setup the routes and delegate logic to the controllers 
// --------------------------------------------------------------------------
exports.setup = function(app) {
	//app.get('/', baseController.index);

	app.get('/api/' + API + '/version', baseController.version);
	app.get('/api/' + API + '/tags', tagsController.index);
  app.get('/api/' + API + '/documents', documentsController.index);
};