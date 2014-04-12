
// test the basic features of sqlite

'use strict';

var database = require('./app/config/database');
var mongoose = require('mongoose');

var uristring = database.uri;
mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log('Succeeded connected to: ' + uristring);
  }
});


var simpleSchema = new mongoose.Schema({
  name: {
    first: String,
    last: {
      type: String,
      trim: true
    }
  },
  age: {
    type: Number,
    min: 0
  }
});

var Entry = mongoose.model('simple', simpleSchema);
var item = new Entry({
  name: { first: 'Hugo', last: ' Simon '},
  age: 45
});


Entry.remove({ age: 45 }, function (err) {
  // save the entry to the mongodb
  item.save(function (err) {
    if (err) {
      console.log('Error on save!');
    } else {
      console.log('item saved');

      // find the entry
      Entry.find({}).exec(function (err, result) {
        if (!err) {
          // handle result
          console.log('found result: ' + result.length);
        } else {
          // error handling
          console.log(err);
        }
        mongoose.connection.close();
      });
    }
  });
});