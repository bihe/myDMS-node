// doa implementation to access the data in the tags table
'use strict';

var sqlite3 = require('sqlite3').verbose();
var Tag = require('./tag');

// crud operation for tags
// --------------------------------------------------------------------------
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

// read all tag entries
// --------------------------------------------------------------------------
TagDao.prototype.add = function(tag, done) {
  this.db.run('INSERT INTO tag (name) VALUES (?)', tag.name, function(err) {
    if (err) {
      console.log('add a tag: ' + err);
      throw err;
    }
    done(this.lastID);
  });

};

// read all tag entries
// --------------------------------------------------------------------------
TagDao.prototype.list = function(done) {
  var result = [];
  this.db.all('SELECT id, name FROM tag', function(err, rows) {
    if (err) {
      console.log('select tags: '+ err);
      throw err;
    }
    for (var i = 0; i < rows.length; i++) {
      var tag = new Tag(rows[i].id, rows[i].name);
      result.push(tag);
    }
    done(result);
  });
};

module.exports = TagDao;