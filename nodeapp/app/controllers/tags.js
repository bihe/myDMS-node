/*
 * basic controller logic to display the different templates
 * base.js created by Henrik Binggl
 */
'use strict';

var base = require('./base');
var Tag = require('../models/tag.js');

/*
 * url: /tags
 * called without any parameters just returns all of the available tags in 
 * alphabetical order
 */
exports.index = function( req, res, next ) {
  Tag.find( { $query: { }, $orderby: { name : 1 } } ).exec(function (err, tags) {
    if(err) {
      return base.handleError(req, res, next, err);
    }
    res.json(tags);
  });
};