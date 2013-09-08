/*
 * define the routes to the handling controllers
 * index.js created by Henrik Binggl
 */
'use strict';

var baseController = require('../controllers/base');
var tagsController = require('../controllers/tags');

// setup the routes and delegate logic to the controllers 
// --------------------------------------------------------------------------
exports.setup = function(app) {
	app.get('/', baseController.index);

	app.get('/tags', tagsController.index);
};