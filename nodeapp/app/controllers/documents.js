/*
 * handle documents interaction
 */
'use strict';

var base = require('./base');
var logger = require('../util/logger' );
var config = require('../config/application');
var Document = require('../models/document.js');
var randomstring = require('randomstring');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');


// --------------------------------------------------------------------------
// helpers
// --------------------------------------------------------------------------

function getExtension( filename ) {
  var i = filename.lastIndexOf('.');
  return (i < 0) ? '' : filename.substr(i);
}


/*
 * url: /documents
 * called without any parameters just returns all of the available documents 
 */
exports.index = function( req, res, next ) {
  Document.find( { $query: { }, $orderby: { name : 1 } } ).exec(function ( err, documents ) {
    if( err ) {
      return base.handleError( req, res, next, err );
    }
    res.json( documents );
  });
};

/* 
 * url: /documents/upload
 * upload a binary document and store it temporarily, when the 
 * document is saved later on move the temp file to the target location
 */
exports.upload = function( req, res, next ) {
  var tempFileName, result, fileObject, wrongContentType, wrongExtension, fileExt;

  fileObject = req.files.file;
  console.log( 'received upload data!' );
  logger.dump( fileObject );

  // basic validations: check for content-types and file-extensions
  // including max-file-size
  if( fileObject.size > config.application.upload.maxFileSize ) {
    return res.send('max-file-size-limit', 500);
  }
  // check allowed content-types
  wrongContentType = true;
  _.forEach( config.application.upload.ctypes, function( ctype ) {
    if( fileObject.type.indexOf( ctype ) > -1 ) {
      if(wrongContentType) {
        wrongContentType = false;
      }
    }
  });
  if( wrongContentType ) {
    return res.send('incorrect-content-type', 500);
  }
  // check for file-extensions
  wrongExtension = true;
  fileExt = getExtension( fileObject.originalFilename );
  _.forEach( config.application.upload.extensions, function( ext ) {
    if( fileExt.indexOf( ext ) > -1 ) {
      if( wrongExtension ) {
        wrongExtension = false;
      }
    }
  });
  if( wrongExtension ) {
    return res.send('incorrect-file-extension', 500);
  }

  // use this random string as a temp filename - return the string as a reference
  tempFileName = randomstring.generate( 8 ) + fileExt;

  fs.readFile(fileObject.path, function ( err, data ) {
    var newPath = path.join(__dirname, '../../', config.application.upload.tempFilePath) + '/' + tempFileName;
    fs.writeFile( newPath, data, function ( err ) {
      if( err ) {
        return base.handleError( req, res, next, err );
      }
      result = {};
      result.fileName = tempFileName;
      result.originalFileName = fileObject.originalFilename;
      result.size = fileObject.size;

      logger.dump( result );

      res.json(result);
    });
  });
};
