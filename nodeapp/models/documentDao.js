/**
 * doa implementation to access the document data
 */
'use strict';

var sqlite3 = require('sqlite3').verbose();
var q = require('q');
var _ = require('lodash');
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
    self.db.run('INSERT INTO document (alternativeId, title, fileName, previewLink, amount) VALUES (?, ?, ?, ?, ?)', document.alternativeId, document.title, document.fileName, document.previewLink, document.amount, function(err) {
      if (err) {
        console.log('add a document: ' + err);
        return deferred.reject(err);
      }

      var docId = this.lastID;

      if(document.tags && document.tags.length > 0) {

        //console.log('Will process the tags: ' + document.tags.length);

        // process tags
        // if a tag is not available, create it, then reference it

        var tagDao = new TagDao('', self.db);
        var tag;
        var length = document.tags.length;
        var counter = 0;
        _.forEach(document.tags, function(tag) {
          
          tagDao.byName(tag.name).then(function(t) {

            if(t.id > -1) {

              self.db.run('INSERT INTO document_tags (doc_id, tag_id) VALUES (?, ?)', docId, t.id, function(err) {
                if (err) {
                  console.log('add document_tags: ' + err);
                  return deferred.reject(err);
                }

                counter += 1;

                //console.log('counter: ' +  counter + ' / length: ' +  length);
                if(counter === length) {
                  console.log('[' + new Date().getTime() + '] resolve the promise!');
                  deferred.resolve(docId);
                }
              });

            } else {
              
              // no tag available, add one
              tagDao.add(tag).then(function(tagId) {

                self.db.run('INSERT INTO document_tags (doc_id, tag_id) VALUES (?, ?)', docId, tagId, function(err) {

                  if (err) {
                    console.log('add document_tags: ' + err);
                    return deferred.reject(err);
                  }

                  counter += 1;

                  //console.log('counter: ' +  counter + ' / length: ' +  length);
                  if(counter === length) {
                    console.log('[' + new Date().getTime() + '] resolve the promise!');
                    deferred.resolve(docId);
                  }

                });
              });

            }
            
          }).fail(function(error) {
            return deferred.reject(error);
          });

        });
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
  }
};

module.exports = DocumentDao;