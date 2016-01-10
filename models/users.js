'use strict';

var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var Users = new mongoose.Schema(
{
  // _id added automatically,
  // username added automatically,
  // salt and hash are added automatically,
  // hash are added automatically,
  firstName:String,
  lastName:String,
},
{
  collection:"users"
});

Users.plugin(passportLocalMongoose);
module.exports = mongoose.model('users', Users);
