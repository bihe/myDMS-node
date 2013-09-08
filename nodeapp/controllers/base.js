/*
 * basic controller logic to display the different templates
 * base.js created by Henrik Binggl
 */
'use strict';

exports.index = function(req, res){
  res.render('index', {templates: 'mustache template'});
};