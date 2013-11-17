// test the basic features of sqlite

'use strict';

var fs = require("fs");

var dbConfig = require('../config/database');
var Tag = require('../models/tag');
var TagDao = require('../models/tagDao');

var exists = false; //fs.existsSync(dbConfig.path);

if(!exists) {
  console.log("+ Creating DB file.");
  fs.openSync(dbConfig.path, "w");
}

var tagDao = new TagDao(dbConfig.path, exists);
var tag = new Tag(1, 'testtag');

tagDao.add(tag, function() {
  console.log('    + done add tag');

  tagDao.list(function(result) {
  console.log('    + done list tags');
    console.log(result);
  });
});