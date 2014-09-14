/*
 * handle documents interaction
 */
'use strict';

var base = require('./base');
var logger = require('../util/logger' );
var utils = require('../util/utils' );
var config = require('../config/application');
var StorageService = require('../services/storageService');
var UserService = require('../services/userService');

/*
 * url: /drive/listfiles
 * display files from google drive
 */
exports.listfiles = function(req, res, next) {
  var userService = new UserService()
    , storageService = new StorageService();

  // get the user-id and retrieve the necessary token
  userService.getTokenFromUser(req.user).then(function(token) {

    return storageService.folderExists('000 testFolder', '0B_XK0TbSeuZUaEhvTjBlZDI0Zmc', token);
  }).then(function(response) {

    console.log(response);
    res.status(200).send(response);
  }).catch(function (err) {

    console.log(err);
    return res.status(500).send('Got an error: ' + err.code + ' / ' + err.message);
  }).done();
};


exports.getfile  = function(req, res, next) {
  var userService = new UserService()
    , storageService = new StorageService()
    ;

  // get the user-id and retrieve the necessary token
  userService.getTokenFromUser(req.user).then(function(token) {

    return storageService.getFile('versicherung.pdf', '0B_XK0TbSeuZUU2J6NnpuRDBIcTA', token);
  }).then(function(response) {

    console.log(response);
    res.status(200).send(response);
  }).catch(function (err) {

    console.log(err);
    return res.status(500).send('Got an error: ' + err.code + ' / ' + err.message);
  }).done();
};
