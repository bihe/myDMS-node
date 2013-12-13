/**
 * doa implementation to access the document data
 */
'use strict';

var sqlite3 = require('sqlite3').verbose();
var q = require('q');
var _ = require('lodash');
var async = require('async');
var Document = require('./document');
var Tag = require('./tag');
var TagDao = require('./tagDao');

/**
 * a class impementing a data access object
 * @constructor 
 * @param {string} path - the path to the database file
 * @param {sqlite.Database} db - a databse object
 */
function DocumentDao(path, db) {
  if(db) {
    this.db = db;
  } else {
    this.db = new sqlite3.Database(path);
  }
}

DocumentDao.prototype = {

  /**
   * @method add a document to the store
   * @param {Document} document - a Document object
   * @returns {promise: function(insertedId)} a promise (Q)
   */
  add: function(document) {
    var deferred = q.defer();
    var self = this;

    // TODO: serial SQL, use tx

    self.db.run('INSERT INTO document (alternativeId, title, fileName, previewLink, amount) VALUES (?, ?, ?, ?, ?)', document.alternativeId, document.title, document.fileName, document.previewLink, document.amount, function(err) {
      if (err) {
        console.log('add a document: ' + err);
        return deferred.reject(err);
      }

      var docId = this.lastID;

      if(document.tags && document.tags.length > 0) {
        document.id = docId;
        self.__handleTags(document, deferred, function() { deferred.resolve(docId); });

      } else {
        deferred.resolve(docId);
      }
      
    });

    return deferred.promise;
  },

  /**
   * @method update the document in the store
   * @param {Document} document - document object with the 'new' values
   * @returns {promise: function(numupdates)} a promise (Q)
   */
  update: function(document) {
    var deferred = q.defer();
    this.db.run('UPDATE document SET title = ?, fileName = ?, previewLink = ?, amount = ? WHERE id = ?', document.title, document.fileName, document.previewLink, document.amount, document.id, function(err) {
      if (err) {
        console.log('update a document: ' + err);
        return deferred.reject(err);
      }
      deferred.resolve(this.changes);
    });
    return deferred.promise;
  },

  /**
   * @method retrieve a document from the store
   * @param {id} id - the id of the document
   * @returns {promise: function(Document)} a promise (Q)
   */
  get: function(id) {
    var deferred = q.defer();
    this.db.get('SELECT * FROM document WHERE id = ?', id, function(err, row) {
      if (err) {
        console.log('add a document: ' + err);
        return deferred.reject(err);
      }

      var doc = new Document({id: row.id, title: row.title, alternativeId: row.alternativeId, fileName: row.fileName, previewLink: row.previewLink, created: row.created, amount: row.amount});

      deferred.resolve(doc);
    });
    return deferred.promise;
  },

  /**
   * @method delete a document by its id
   * @param {int} id - the id of the document to delete
   * @returns {promise: function(changes)} a promise (Q)
   */
  delete: function(id) {
    var deferred = q.defer();
    this.db.run('DELETE from document WHERE id = ?', id, function(err) {
      if(err) {
        console.log('delete a document: ' + err);
        return deferred.reject(err);
      }
      deferred.resolve(this.changes);
    });
    return deferred.promise;
  },

  /**
   * @method read all document entries
   * @param {string} search - search for documents with the given name
   * @returns {promise: function(Document[])} a promise (Q)
   */
  list: function(search) {
    var deferred = q.defer();
    var result = [];

    var query = 'SELECT * FROM document';
    var params = [];
    if(search) {
      query = 'SELECT * FROM document WHERE title LIKE ? OR fileName LIKE ?';
      params.push('%' + search + '%');
      params.push('%' + search + '%');
    }

    this.db.all(query, params, function(err, rows) {
      if (err) {
        console.log('select documents: '+ err);
        return deferred.reject(err);
      }
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var doc = new Document({id: row.id, title: row.title, alternativeId: row.alternativeId, fileName: row.fileName, previewLink: row.previewLink, created: row.created, amount: row.amount});
        result.push(doc);
      }
      deferred.resolve(result);
    });
    return deferred.promise;
  },

  /**
   * @method close the underlying connection
   */
  close: function() {
    this.db.close();
  },


  /**
   * @method private helper to manage tag handling for a document
   * @param {Document} document - the document object
   * @param {promise - Q} deferred - a promise to resolve
   * @param {function} done - a callback once finished
   */
  __handleTags: function(document, deferred, done) {

    var self = this;
    var docId = document.id;
    var tagIds = [];
    var tagNames = [];
    var tagDao = new TagDao('', self.db);

    async.series([
        // check for existing tags
        function(callback) {

          _.forEach(document.tags, function(tag, index) {
            tagDao.byName(tag.name).then(function(t) {
              
              if(t.id > -1) {
                tagIds.push(t.id);
              } else {
                // tag.name not found, we need to create the tag
                tagNames.push(tag.name);
              }
              if(index === document.tags.length -1) {
                
                callback(null);
              }
            }).fail(function(error) {
              callback(error);
            });
          });
        },
        // add the tags to the store
        function(callback) {
          
          _.forEach(tagNames, function(name, index) {
            var tag = new Tag(-1, name);
            tagDao.add(tag).then(function(tagId) {
              
              tagIds.push(tagId);
              if(index === tagNames.length -1) {
                callback(null);
              }
            }).fail(function(error) {
              callback(error);
            });
          });
        },
        // got the ids of the tags -- add to the document relation
        function(callback) {
          
          _.forEach(tagIds, function(id, index) {
            self.db.run('INSERT INTO document_tags (doc_id, tag_id) VALUES (?, ?)', docId, id, function(err) {
              if (err) {
                console.log('add document_tags: ' + err);
                return callback('add document_tags: ' + err);
              }

              if(index === tagIds.length -1) {
                callback(null);
              }
            });
            
          });
        }
      ],
      function(error, result) {
        if(error) {
          return deferred.reject(error);
        }

        // console.log(tagNames);
        // console.log(tagIds);
        // console.log('resolve the promise');

        // reached the end of the functions - resolve the promise
        done();
      }
    );

  }
};

module.exports = DocumentDao;