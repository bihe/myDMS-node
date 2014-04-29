/*
 * handling of senders
 * senders.js created by Henrik Binggl
 */
'use strict';

var base = require('./base');
var Sender = require('../models/sender.js');

/*
 * url: /senders
 * called without any parameters just returns all of the available senders in 
 * alphabetical order
* uses 'q' to search for senders
 */
exports.index = function( req, res, next ) {
  var filter = {};
  if(req.query.q) {
    filter.name = {};
    filter.name.$regex = new RegExp(req.query.q);
  }
  console.log('filter: ' + filter.name );
  Sender.find( filter ).sort('name').exec(function (err, senders) {
    if(err) {
      return base.handleError(req, res, next, err);
    }
    res.json(senders);
  });
};