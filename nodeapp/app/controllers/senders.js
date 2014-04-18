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
 */
exports.index = function( req, res, next ) {
  Sender.find( { $query: { }, $orderby: { name : 1 } } ).exec(function (err, senders) {
    if(err) {
      return base.handleError(req, res, next, err);
    }
    res.json(senders);
  });
};