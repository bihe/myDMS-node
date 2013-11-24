/**
 * doa implementation to access the data in the senders table
 */
'use strict';

var sqlite3 = require('sqlite3').verbose();
var q = require('q');
var Sender = require('./sender');

/**
 * a class impementing a data access object
 * @constructor 
 * @param {string} path - the path to the database file
 * @param {bool} create - create the table for testing purpose
 */
function SenderDao(path, create) {
  this.db = new sqlite3.Database(path);
  if(create) {
    this.db.exec('CREATE TABLE sender (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);', function(err) {
      if (err) {
        console.log('create table sender: ' + err);
        throw err;
      }
    });
  }
}

SenderDao.prototype = {

  /**
   * @method add a sender to the store
   * @param {Sender} sender - a Sender object
   * @returns {promise: function(insertedId)} a promise (Q)
   */
  add: function(sender) {
    var deferred = q.defer();
    this.db.run('INSERT INTO sender (name) VALUES (?)', sender.name, function(err) {
      if (err) {
        console.log('add a sender: ' + err);
        return deferred.reject(err);
      }
      deferred.resolve(this.lastID);
    });
    return deferred.promise;
  },

  /**
   * @method delete a sender by its id
   * @param {int} id - the id of the sender to delete
   * @returns {promise: function(changes)} a promise (Q)
   */
  delete: function(id) {
    var deferred = q.defer();
    this.db.run('DELETE from sender WHERE id = ?', id, function(err) {
      if(err) {
        console.log('delete a sender: ' + err);
        return deferred.reject(err);
      }
      deferred.resolve(this.changes);
    });
    return deferred.promise;
  },

  /**
   * @method read all sender entries
   * @param {string} search - search for senders with the given name
   * @returns {promise: function(Sender[])} a promise (Q)
   */
  list: function(search) {
    var deferred = q.defer();
    var result = [];

    var query = 'SELECT id, name FROM sender';
    var params = [];
    if(search) {
      query = 'SELECT id, name FROM sender WHERE name LIKE ?';
      params.push('%' + search + '%');
    }

    this.db.all(query, params, function(err, rows) {
      if (err) {
        console.log('select senders: '+ err);
        return deferred.reject(err);
      }
      for (var i = 0; i < rows.length; i++) {
        var sender = new Sender(rows[i].id, rows[i].name);
        result.push(sender);
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

module.exports = SenderDao;