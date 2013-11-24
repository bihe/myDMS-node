/**
 * setup the necessary database
 */
'use strict';

var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var q = require('q');
require('class4js');

/**
  * if the persistence store is not available create the database
  * from scratch
  */
var PersitenceModel = $class({
  
  /**
   * @constructor default ctor
   * @param {string} dbPath - the path to the persitence file
   * @param {bool} foreNew - should the db be recreated
   */
  __construct__: function (dbPath, forceNew) {
    this.dbPath = dbPath;
    this.forceNew = forceNew;
  },

  /**
   * @method setup the necessary tables if the store is not available
   * @returns {promise} a promise (Q)
   */
  setup: function(done) {

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

    if(!exists) {
      if(this.dbPath !== ':memory:') {
        fs.openSync(this.dbPath, 'w');
      }
      var db = new sqlite3.Database(this.dbPath);
      var numberOfTables = 0;
      //console.log('    + db does not exist - create the tables');

      //console.log('    + create table tag');
      db.exec('CREATE TABLE tag (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);', function(err) {
        if (err) {
          console.log('create table tag: ' + err);
          return deferred.reject(err);
        }

        numberOfTables += 1;

        //console.log('    + create table sender');
        db.exec('CREATE TABLE sender (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);', function(err) {
          if (err) {
            console.log('create table sender: ' + err);
            return deferred.reject(err);
          }

          numberOfTables += 1;

          db.exec('CREATE TABLE document (id INTEGER PRIMARY KEY AUTOINCREMENT, alternativeId TEXT NOT NULL, title TEXT NOT NULL, fileName TEXT NOT NULL, previewLink TEXT, created datetime default current_timestamp);', function(err) {
            if (err) {
              console.log('create table document: ' + err);
              return deferred.reject(err);
            }

            numberOfTables += 1;

            deferred.resolve( (numberOfTables === 3) );

            db.close();

          });
          
        });
        
      });
    }

    return deferred.promise;
  }

});

module.exports = PersitenceModel;