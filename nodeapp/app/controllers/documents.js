/*
 * handle documents interaction
 */
'use strict';

var Document = require('../models/document.js');

/*
 * url: /documents
 * called without any parameters just returns all of the available documents 
 */
exports.index = function( req, res ) {
  Document.find( { $query: { }, $orderby: { name : 1 } } ).exec(function (err, documents) {
    if(err) {
      //handleError(err);
    }

    res.json(documents);
  });
};