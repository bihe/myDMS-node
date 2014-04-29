/*
 * handling of tags
 * tags.js created by Henrik Binggl
 */
'use strict';

var base = require('./base');
var Tag = require('../models/tag.js');

/*
 * url: /tags
 * called without any parameters just returns all of the available tags in 
 * alphabetical order
 * uses 'q' to search for tags
 */
exports.index = function( req, res, next ) {

  var filter = {};
  if(req.query.q) {
    filter.name = {};
    filter.name.$regex = new RegExp(req.query.q);
  }
  console.log('filter: ' + filter.name );
  Tag.find( filter ).sort('name').exec(function (err, tags) {
    if(err) {
      return base.handleError(req, res, next, err);
    }
    res.json(tags);
  });
};