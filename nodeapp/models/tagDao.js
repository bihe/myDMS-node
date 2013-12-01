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
 * @param {sqlite.Database} db - a databse object
 */
function TagDao(path, db) {
  if(db) {
    this.db = db;
  } else {
    this.db = new sqlite3.Database(path);
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
   * @method return the tag by the given name
   * @param {string} tagName - search for the given name
   * @returns {promise: function(Tag)} a promise (Q)
   */
  byName: function(tagName) {
    var deferred = q.defer();
    var tag = new Tag();

    var query = 'SELECT * FROM tag WHERE lower(name) = ?';
    this.db.get(query, tagName.toLowerCase(), function(err, row) {
      if (err) {
        console.log('byName tag: '+ err);
        return deferred.reject(err);
      }
      if(row) {
        tag = new Tag(row.id, row.name);
        deferred.resolve(tag);
      } else {
        tag = new Tag(-1, null);
        return deferred.resolve(tag);
      }  
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