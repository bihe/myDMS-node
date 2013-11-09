/*
 * basic controller logic to display the different templates
 * base.js created by Henrik Binggl
 */
'use strict';

var version = require('../config/version');

// the index path - render the mustache template
exports.index = function(req, res){
  res.render('index', {templates: 'mustache template'});
};

// return the current version as plain/text
exports.version = function(req, res) {
	res.write(version.number);
	res.end();
};