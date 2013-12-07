/**
 * setup the necessary database
 */
'use strict';

var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var q = require('q');

/**
 * @constructor default ctor
 * @param {string} dbPath - the path to the persitence file
 * @param {bool} foreNew - should the db be recreated
 */
function PersitenceModel(dbPath, forceNew) {
  this.dbPath = dbPath;
  this.forceNew = forceNew;
  this.db = null;
}

PersitenceModel.prototype = {
  /**
   * @method setup the necessary tables if the store is not available
   * @returns {promise} a promise (Q)
   */
  setup: function() {

    var deferred = q.defer();

    var exists = false;
    if(this.dbPath !== ':memory:') {

      exists = fs.existsSync(this.dbPath);

      if(exists && !this.forceNew) {
        deferred.resolve();
        return deferred.promise;
      }

      if(exists && this.forceNew) {
        console.log('force new db file - remove it first');
        fs.unlinkSync(this.dbPath);
        exists = false;
      }
    }

    var self = this;
    if(!exists) {

      if(self.dbPath !== ':memory:') {
        fs.openSync(this.dbPath, 'w');
      }
      self.db = new sqlite3.Database(this.dbPath);

      // self.db.on('trace', function(param) {
      //   if(self.dbPath !== ':memory:') {
      //     console.log(':: trace: ' + param);
      //   }
      // });

      var numberOfTables = 0;

      //console.log('    + db does not exist - create the tables');

      //console.log('    + create table tag');
      self.db.exec('CREATE TABLE tag (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);', function(err) {
        if (err) {
          console.log('create table tag: ' + err);
          return deferred.reject(err);
        }

        numberOfTables += 1;

        //console.log('    + create table sender');
        self.db.exec('CREATE TABLE sender (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);', function(err) {
          if (err) {
            console.log('create table sender: ' + err);
            return deferred.reject(err);
          }

          numberOfTables += 1;

          var __db = self.db.exec('CREATE TABLE document (id INTEGER PRIMARY KEY AUTOINCREMENT, alternativeId TEXT NOT NULL, title TEXT NOT NULL, fileName TEXT NOT NULL, previewLink TEXT, created datetime default current_timestamp, amount numeric);'
            + ' CREATE TABLE document_tags (doc_id INTEGER NOT NULL, tag_id INTEGER NOT NULL);'
            + ' CREATE TABLE document_senders (doc_id INTEGER NOT NULL, sender_id INTEGER NOT NULL);', function(err) {
            
            if (err) {
              console.log('create table document: ' + err);
              return deferred.reject(err);
            }

            numberOfTables += 3;
            deferred.resolve( (numberOfTables === 5) );

          });

          __db.on('error', function(param) {
            console.log('error: ' + param);
          });
          
        });
        
      });
    }

    return deferred.promise;
  },

  /**
   * @method provide access to the underlying db obejct
   */
  db: function() {
    return this.db;
  },

  /**
   * @method access the underlying db connection
   */
  close: function() {
    this.db.close();
  }

};

module.exports = PersitenceModel;