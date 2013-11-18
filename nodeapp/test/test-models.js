// test the basic features of sqlite

'use strict';

var dbConfig = require('../config/database');
var Tag = require('../models/tag');
var TagDao = require('../models/tagDao');
var should = require('should');
var assert = require('assert');
var fs = require('fs');

describe('models', function() {

  describe('Tags', function() {
    
    it('instantiate a new tag', function() {
      var tag = new Tag(1, 'testtag');
      tag.id.should.eql(1);
      tag.name.should.eql('testtag');
    });

    it('should support basic crud operations', function() {

      var exists = false; //fs.existsSync(dbConfig.path);

      if(!exists) {
        //console.log('+ Creating DB file.');
        fs.openSync(dbConfig.path, 'w');
      }

      var tagDao = new TagDao(dbConfig.path, exists);
      var tag = new Tag(1, 'testtag');

      tagDao.add(tag).then(function(id) {
        assert.equal(id, 1, 'The inserted id does not match');

        return tagDao.add(tag);

      }).then(function(id) {
        assert.equal(id, 2, 'The inserted id does not match');

        return tagDao.list();

      }).then(function(result) {
        assert.equal(result.length, 2, 'Number of retrieved elements not equal!');

      })
      .done();

    });

  });
});