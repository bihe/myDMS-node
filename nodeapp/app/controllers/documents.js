/*
 * handle documents interaction
 */
'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var base = require('./base');
var logger = require('../util/logger' );
var utils = require('../util/utils' );
var config = require('../config/application');
var Document = require('../models/document.js');
var StorageService = require('../services/storageService');
var DocumentService = require('../services/documentService');
var MasterDataService = require('../services/masterDataService');
var UserService = require('../services/userService');
var google = require('../config/google');
var randomstring = require('randomstring');

/*
 * url: /documents
 * called without any parameters just returns all of the available documents
 */
exports.index = function( req, res, next ) {
  var filter = {}, filterValue,
      skip = 0, limit = 20,
      parts = [],
      logicalAnd = [];

  if(req.query.skip) {
    skip = parseInt(req.query.skip, 10);
  }
  if(req.query.limit) {
    limit = parseInt(req.query.limit, 10);
  }
  if(req.query.t) {
    filterValue = req.query.t;
    if(filterValue === '*') {
      filterValue = '.*'; // search anything
    }
    filter = {};
    filter.title = {};
    filter.title.$regex = new RegExp(filterValue, 'i');
    logicalAnd.push(filter);
  }
  if(req.query.df) {
    filterValue = req.query.df;
    filter = {};
    filter.created = {};
    filter.created.$gte = utils.parseDate(filterValue, false);
    logicalAnd.push(filter);
  }
  if(req.query.dt) {
    filterValue = req.query.dt;
    filter = {};
    filter.created = {};
    filter.created.$lte = utils.parseDate(filterValue, true);
    logicalAnd.push(filter);
  }
  if(req.query.sender) {
    filterValue = req.query.sender;
    filter = {};
    filter.senders = filterValue;
    logicalAnd.push(filter);
  }
  if(req.query.tag) {
    filterValue = req.query.tag;
    parts = filterValue.split(',');
    for(var i=0;i < parts.length;i++) {
      filter = {};
      filter.tags = parts[i];
      logicalAnd.push(filter);
    }
  }

  // only show valid documents -- state 'done'
  filter = {};
  filter.state = 'done';
  logicalAnd.push(filter);

  // combine the filters
  if(logicalAnd.length > 1) {
    filter = {};
    filter.$and = logicalAnd;
  }

  logger.dump(filter);

  Document.find(filter).sort({created: -1, title: 1})
  .skip(skip)
  .limit(limit)
  .populate('tags senders')
  .exec(function ( err, documents ) {
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
    return res.status(500).send('max-file-size-limit');
  }
  // check allowed content-types
  wrongContentType = true;
  _.forEach( config.application.upload.ctypes, function( ctype ) {
    if( fileObject.mimetype.indexOf( ctype ) > -1 ) {
      if(wrongContentType) {
        wrongContentType = false;
      }
    }
  });
  if( wrongContentType ) {
    return res.status(500).send('incorrect-content-type');
  }
  // check for file-extensions
  wrongExtension = true;
  fileExt = utils.getExtension( fileObject.originalname );
  _.forEach( config.application.upload.extensions, function( ext ) {
    if( fileExt.indexOf( ext ) > -1 ) {
      if( wrongExtension ) {
        wrongExtension = false;
      }
    }
  });
  if( wrongExtension ) {
    return res.status(500).send('incorrect-file-extension');
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
      result.contentType = fileObject.mimetype;
      result.fileName = tempFileName;
      result.originalFileName = fileObject.originalname;
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
    if(!doc) {
      return res.status(404).send('Document not found ' + req.params.id);
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
      credentials,
      userService = new UserService(),
      masterDataService = new MasterDataService(),
      documentService = new DocumentService();

  try {

    document = req.body;
    logger.dump( document );

    // do a server-side validation
    if(!document.title || !document.fileName || document.senders.length === 0) {
      return res.status(500).send('Invalid data supplied, or some necessary data missing!');
    }

    // validation done - at least we do have some data
    // use promises to handle tags, senders, and the document itself

    // get the user-id and retrieve the necessary token
    userService.getTokenFromUser(req.user).then(function(token) {
      credentials = token;
      return masterDataService.createAndGetTags(document.tags, true);
    }).then(function(list) {
      tagList = list;
      // start the promise chain
      return masterDataService.createAndGetSenders(document.senders, false);
    })
    .then(function(list) {
      senderList = list;
      // got both - overwrite the lists of the object
      document.tags = tagList;
      document.senders = senderList;
      document.created = null; // I do not want to update the creation date!

      return documentService.save(document);
    })
    .then(function(doc) {
      console.log('Saved the document: ' + doc);

      // move files and update the document
      return documentService.handleDocumentUpload(doc, document, credentials);
    })
    .then(function(doc) {
      // when a document is saved, the state is changed
      // this is the last step of the processing, update the state so the doc
      // is shown
      return documentService.endDocumentChange(doc.id);
    })
    .then(function(doc) {
      if(!doc) {
        return res.status(500).send('Cannot save document - document is null!');
      }
      return res.status(200).send('Document saved!');
    })
    .catch(function(error) {
      logger.dump(error);
      console.log(error.stack);
      return res.status(500).send('Cannot save document! ' + error);
    })
    .done();

  } catch(err) {
    logger.dump(err);
    console.log(err.stack);

    return res.status(500).send('Cannot save document! ' + err);
  }

};

/*
 * url: /document/download/:id
 * return the binary data of the document to the client
 */
exports.documentDownload = function( req, res, next ) {
  var id = req.params.id
    , documentService = new DocumentService()
    , storageService = new StorageService()
    , userService = new UserService()
    , parts = []
    , folderName
    , searchFileName
    , document
    , credentials;

  console.log('Got param: ' + id);

  // get the user-id and retrieve the necessary token
  userService.getTokenFromUser(req.user).then(function(token) {
    // got the user credentials to access the backend-system
    credentials = token;
    return documentService.getDocumentById(id);
  }).then(function(doc) {
    document = doc;
    // got the document, based on the path query the google drive backend service
    // split the document filename /dir/file
    // parts[0] is an empty string, index 1 and 2 contain the relevant parts
    console.log(document.fileName);
    parts = document.fileName.split('/');
    if(parts && parts.length === 3) {
      // leading slash
      folderName = parts[1];
      searchFileName = parts[2];
    } else if(parts && parts.length === 2) {
      // no leading slash
      folderName = parts[0];
      searchFileName = parts[1];
    }
    console.log('Use folder ' + folderName + ' file ' + searchFileName + ' parent ' + google.drive.PARENT_ID);
    return storageService.folderExists(folderName, google.drive.PARENT_ID, credentials);

  }).then(function(result) {
    // check if the folder is available
    if (result.exists === true) {
      // use the folder-id to search for the specific file
      return storageService.getFile(searchFileName, result.id, credentials);
    } else {
      // perform a local search for the document
      documentService.getBinary(id).then(function (filePath) {
        // send the file to the requesting client
        res.sendFile(filePath, function (error) {
          if (error) {
            return res.status(500).send('Could not download file ' + error);
          }
        });
      }).catch(function (error) {
        return res.status(404).send('Document not found! ' + error);
      }).done();
    }
  }).then(function(result) {
    if(result) {
      res.redirect(result.previewUrl);
    }
    else {
      return res.status(404).send('Document not found! ');
    }

  }).catch(function(error) {
    console.log(error);
    return res.status(404).send('Document not found! ' + error);
  }).done();
};

/*
 * url: /document/:id
 * delete the given document
 */
exports.deleteDocument = function( req, res, next ) {
  var id = req.params.id;

  console.log('Got param: ' + id);

  Document.findById(id, function (err, document) {
    if(err) {
      return res.status(500).send('Could not delete document ' + err);
    }

    document.remove(function(err) {
      if(err) {
        return res.status(500).send('Could not delete document ' + err);
      }

      return res.status(200).send('Document with id ' + id + ' removed!');
    });
  });
};
