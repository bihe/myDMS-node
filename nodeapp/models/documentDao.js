/**
 * doa implementation to access the document data
 */
'use strict';

var sqlite3 = require('sqlite3').verbose();
var q = require('q');
var Document = require('./document');

/**
 * a class impementing a data access object
 * @constructor 
 * @param {string} path - the path to the database file
 * @param {bool} create - create the table for testing purpose
 */
function DocumentDao(path, create) {
  this.db = new sqlite3.Database(path);
  if(create) {
    this.db.exec('CREATE TABLE document (id INTEGER PRIMARY KEY AUTOINCREMENT, alternativeId TEXT NOT NULL, title TEXT NOT NULL, fileName TEXT NOT NULL, previewLink TEXT, created datetime default current_timestamp);', function(err) {
      if (err) {
        console.log('create table document: ' + err);
        throw err;
      }
    });
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
    this.db.run('INSERT INTO document (alternativeId, title, fileName, previewLink) VALUES (?, ?, ?, ?)', document.alternativeId, document.title, document.fileName, document.previewLink, function(err) {
      if (err) {
        console.log('add a document: ' + err);
        return deferred.reject(err);
      }
      deferred.resolve(this.lastID);
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

      var doc = new Document({id: row.id, title: row.title, alternativeId: row.alternativeId, fileName: row.fileName, previewLink: row.previewLink, created: row.created});

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
        var doc = new Document({id: row.id, title: row.title, alternativeId: row.alternativeId, fileName: row.fileName, previewLink: row.previewLink, created: row.created});
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