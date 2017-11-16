const mongoose = require('mongoose');


mongoose.connect('mongodb://localhost/Chat', function (err) {
    if (err) console.log('error al conectarse');
    console.log('se conectó la base de datos MongoDB');
  });

var userSchema = new mongoose.Schema({
    userName: {type: String, unique: true},
    name: String,
    password: String
});

module.exports = mongoose.model('usersModel', userSchema);