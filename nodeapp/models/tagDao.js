/**
 * doa implementation to access the data in the tags table
 */
'use strict';

var sqlite3 = require('sqlite3').verbose();
var q = require('q');
var Tag = require('./tag');

/**
 * a class impementing a data access object
 * @constructor 
 * @param {string} path - the path to the database file
 * @param {bool} create - create the table for testing purpose
 */
function TagDao(path, create) {
  this.db = new sqlite3.Database(path);
  if(create) {
    this.db.exec('CREATE TABLE tag (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);', function(err) {
      if (err) {
        console.log('create table tag: ' + err);
        throw err;
      }
    });
  }
}

TagDao.prototype = {

  /**
   * @method add a tag to the store
   * @param {Tag} tag - a Tag object
   * @returns {promise: function(insertedId)} a promise (Q)
   */
  add: function(tag) {
    var deferred = q.defer();
    this.db.run('INSERT INTO tag (name) VALUES (?)', tag.name, function(err) {
      if (err) {
        console.log('add a tag: ' + err);
        return deferred.reject(err);
      }
      deferred.resolve(this.lastID);
    });
    return deferred.promise;
  },

  /**
   * @method delete a tag by its id
   * @param {int} id - the id of the tag to delete
   * @returns {promise: function(changes)} a promise (Q)
   */
  delete: function(id) {
    var deferred = q.defer();
    this.db.run('DELETE from tag WHERE id = ?', id, function(err) {
      if(err) {
        console.log('delete a tag: ' + err);
        return deferred.reject(err);
      }
      deferred.resolve(this.changes);
    });
    return deferred.promise;
  },

  /**
   * @method read all tag entries
   * @param {string} search - search for tags with the given name
   * @returns {promise: function(Tag[])} a promise (Q)
   */
  list: function(search) {
    var deferred = q.defer();
    var result = [];

    var query = 'SELECT id, name FROM tag';
    var params = [];
    if(search) {
      query = 'SELECT id, name FROM tag WHERE name LIKE ?';
      params.push('%' + search + '%');
    }

    this.db.all(query, params, function(err, rows) {
      if (err) {
        console.log('select tags: '+ err);
        return deferred.reject(err);
      }
      for (var i = 0; i < rows.length; i++) {
        var tag = new Tag(rows[i].id, rows[i].name);
        result.push(tag);
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

module.exports = TagDao;