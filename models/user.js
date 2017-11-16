'use strict';

var mongoose = require('mongoose');


var schema = mongoose.Schema;

var userSchema = new schema({
  userName: {type: String, unique: true},
  name: String,
  password: String
});
module.exports = mongoose.model('userModel', userSchema);