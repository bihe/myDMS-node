/*
 * handle documents interaction
 */
'use strict';

var base = require('./base');
var Document = require('../models/document.js');

/*
 * url: /documents
 * called without any parameters just returns all of the available documents 
 */
exports.index = function( req, res, next ) {
  Document.find( { $query: { }, $orderby: { name : 1 } } ).exec(function (err, documents) {
    if(err) {
      return base.handleError(req, res, next, err);
    }
    res.json(documents);
  });
};