/*
 * handle documents interaction
 */
'use strict';

var base = require('./base');
var logger = require('../util/logger' );
var utils = require('../util/utils' );
var config = require('../config/application');
var DocumentService = require('../services/documentService');
var MasterDataService = require('../services/masterDataService');


/*
 * url: /settings
 * post the import data and create objects based on this data
 */
exports.save = function( req, res, next ) {
  var payload, itemCount = 0;

  try {
    payload = req.body;
    logger.dump(payload);

    return res.send('Settings saved! ' + itemCount + ' entries processed!', 200);
  } catch(err) {
    console.log('Got an error: ' + err);
    console.log(err.stack);

    return res.send('Cannot save settings! ' + err, 500);
  }

};