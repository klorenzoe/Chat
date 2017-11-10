/*Los modelos son los que describen el contenido de cada elemento de una collection, 
  cada model es una collection distinta.
*/

'use strict';

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat', function (err) {
  if (err) console.log('error al conectarse');
  console.log('se conectó la base de datos MongoDB');
});


var schema = mongoose.Schema;

var messageSchema = new schema({
  transmitter: String,
  receiver: String,
  date: String,
  text: String
});
module.exports = mongoose.model('messageModel', messageSchema);