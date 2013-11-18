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
 * @param {bool} exists - create the table
 */
function TagDao(path, exists) {
  this.db = new sqlite3.Database(path);
  // this.db.on('trace', function(sql) {
  //   console.log('[trace: ' + sql + ']')
  // });

  if(!exists) {
    console.log('    + db does not exist - create the table');
    this.db.exec('CREATE TABLE tag (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);', function(err) {
      if (err) {
        console.log('create table: ' + err);
        throw err;
      }
    });
  }
}

/**
 * @method add a tag to the store
 * @param {Tag} tag - a Tag object
 * @param {function(id)} done - a finish callback
 * @returns {promise} a promise (Q)
 */
TagDao.prototype.add = function(tag) {
  var deferred = q.defer();
  this.db.run('INSERT INTO tag (name) VALUES (?)', tag.name, function(err) {
    if (err) {
      console.log('add a tag: ' + err);
      return deferred.reject(err);
    }
    deferred.resolve(this.lastID);
  });
  return deferred.promise;
};

/**
 * @method read all tag entries
 * @param {function(list)} done - a finish callback
 * @returns {promise} a promise (Q)
 */
TagDao.prototype.list = function(done) {
  var deferred = q.defer();
  var result = [];
  this.db.all('SELECT id, name FROM tag', function(err, rows) {
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
};

module.exports = TagDao;