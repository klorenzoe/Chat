/*Los modelos son los que describen el contenido de cada elemento de una collection, 
  cada model es una collection distinta.
*/

'use strict';

var mongoose = require('mongoose');

var schema = mongoose.Schema;

var messageSchema = new schema({
  transmitter: String,
  receiver: String,
  date: String,
  text: String,
  isFile: Boolean
});
module.exports = mongoose.model('messageModel', messageSchema);