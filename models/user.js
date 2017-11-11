'use strict';

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat', function (err) {
  if (err) console.log('error al conectarse');
  console.log('se conectó la base de datos MongoDB');
});


var schema = mongoose.Schema;

var userSchema = new schema({
  userName: String,
  name: String,
  password: String
});
module.exports = mongoose.model('userModel', userSchema);