/*
 * handle documents interaction
 */
'use strict';

var base = require('./base');
var logger = require('../util/logger' );
var utils = require('../util/utils' );
var config = require('../config/application');
var Document = require('../models/document.js');
var randomstring = require('randomstring');
var _ = require('lodash');
var fs = require('fs');
var mv = require('mv');
var path = require('path');
var DocumentService = require('../services/documentService');
var MasterDataService = require('../services/masterDataService');


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
 * url: /document/upload
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
  fileExt = utils.getExtension( fileObject.originalFilename );
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

/*
 * url: /document/:id
 * get a document by the given id
 */
exports.document = function(req, res, next) {

  console.log('Got param: ' + req.params.id);

  Document.findById(req.params.id)
  .populate('tags senders')
  .exec(function (err, doc) {
    if( err ) {
      return base.handleError( req, res, next, err );
    }
    res.json(doc);
  });
};

/* 
 * url: /document/
 * create a new document and save it in the backend
 */
exports.saveDocument = function( req, res, next ) {
  var document = {},
      tagList = [],
      senderList = [],
      filePath,
      uploadPath,
      masterDataService = new MasterDataService(),
      documentService = new DocumentService();
  
  try {

    document = req.body;
    logger.dump( document );

    // do a server-side validation
    if(!document.title || !document.amount || !document.fileName || 
      document.tags.length === 0 || document.senders.length === 0) {
      return res.send( 'Invalid data supplied!', 500 );
    }

    // validation done - at least we do have some data
    // use promises to handle tags, senders, and the document itself

    masterDataService.createAndGetTags(document.tags).then(function(list) {
      tagList = list;
      // start the promise chain
      return masterDataService.createAndGetSenders(document.senders);
    })
    .then(function(list) {
      senderList = list;
      // got both - overwrite the lists of the object
      document.tags = tagList;
      document.senders = senderList;

      return documentService.save(document);
    })
    .then(function(doc) {
      console.log('Saved the document: ' + doc);

      // document was saved, I need to move the uploaded file from the temp-folder
      // to the final document location

      if(document.tempFilename && document.tempFilename !== '') {
        uploadPath = path.join(__dirname, '../../', config.application.upload.tempFilePath) + '/' + document.tempFilename;
        filePath = path.join(__dirname, '../../', config.application.upload.filePath) + '/' + document.fileName;
        
        console.log('Will move file from ' + uploadPath + ' to ' + filePath);

        mv(uploadPath, filePath, function(error) {
          if(error) {
            console.log('Could not move file: ' + error);
            console.log(error.stack);

            throw error;
          }

          return res.send('Document saved!', 200);
        });
      } else {

        // document not changed

        return res.send('Document saved!', 200);
      }

    })
    .catch(function(error) {
      console.log(error.stack);
      return res.send('Cannot save document! ' + error, 500);
    })
    .done();

  } catch(err) {
    console.log('Got an error: ' + err);
    console.log(err.stack);

    return res.send('Cannot save document! ' + err, 500);
  }

};