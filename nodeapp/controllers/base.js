/*
 * basic controller logic to display the different templates
 * base.js created by Henrik Binggl
 */
'use strict';

var version = require('../config/version');

exports.index = function(req, res){
  res.render('index', {templates: 'mustache template'});
};

exports.version = function(req, res) {
	res.write(version.number);
	res.end();
};