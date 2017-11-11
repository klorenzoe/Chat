'use strict';

var mongoose = require('mongoose');


var schema = mongoose.Schema;

var userSchema = new schema({
  userName: String,
  name: String,
  password: String
});
module.exports = mongoose.model('userModel', userSchema);