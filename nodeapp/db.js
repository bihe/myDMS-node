// test the basic features of sqlite

'use strict';

var PersitenceModel = require('./models/persistenceModel');
var dbConfig = require('./config/database');
var Tag = require('./models/tag');
var TagDao = require('./models/tagDao');

var pm = new PersitenceModel(dbConfig.path, true);

pm.setup().then(function() {
  console.log('after setup');
  var tagDao = new TagDao(dbConfig.path);
  var tag = new Tag(1, 'testtag');

  tagDao.add(tag).then(function(id) {
    console.log('    + done add tag');

    return tagDao.list();

  }).then(function(result) {
    console.log('    + done list tags');
    console.log(result);
    
  });
});