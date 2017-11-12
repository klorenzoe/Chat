var express = require('express');
var router = express.Router();
var edge = require('edge');
let jwt = require('jsonwebtoken');
const password = "xadfgbhknmkkhgrcbklkmopknnhvvffxjg";

/* Database */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat', function (err) {
  if (!err) console.log('se conectó la base de datos MongoDB chat');

});
const messageCollection = require('../models/message');
const userCollection = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('lobby');
});


router.post('/upload', function (req, res, next) {
  if (!req.files.userFile){
    res.json({valid : false});
  }

  req.files.userFile.mv ('./public/files/' + req.files.userFile.name, function(error){
    let Compressor = edge.func({
      assemblyFile: "dlls\\HuffmanEncoding.dll",
      typeName: "HuffmanEncoding.Huffman",
      methodName: "Compressor"
    });
    console.log('public\\files\\' + req.files.userFile.name);
    Compressor('public\\files\\' + req.files.userFile.name, function(error, result){
      console.log('Dentro del callback de compressor');  
      if(error) throw error;
        let file = new messageCollection({
          transmitter: req.body.transmitter,
          receiver: req.body.receiver,
          date: req.body.date,
          text: 'public\\files\\' + result
        });
        console.log('guardado');
        console.log(file);
        res.json({valid : true});
    });
  });

//.parse enviarselo al huffman y guardarlo en el .mv el archivo comprimido
  
});


//Se genera un token de prueba para poder trabajar "como si ya hubiera iniciado sesion"
router.get('/generate', function (req, res, next) {
  console.log("generando token")
  res.json({ token: jwt.sign({ name: req.query.name, id: req.query.user }, password) });
});

//Se valida el token del usuario
router.get('/validate', function (req, res, next) {
  try {

    let data = jwt.verify(req.query.token, password);
    data.valid = true;
    console.log(data);

    res.json(data);

  } catch (err) {

    // err
    console.log(err)
    res.json({ valid: false });

  }
});

//carga un chat con cualquier usuario
router.get('/user/:user', function (req, res, next) {
  //si exte ese usuario que lo deje, si no que retorne un invalid, lo retorno al lobby
  res.render('chat', { friend: req.params.user });
});

//Metodo que envia el mensaje
router.post('/send', function (req, res, next) {
  //Llamo al método para cifrar de la DLL SDES
  console.log('llama al metodo de la dll encrypt');
  var encrypt = edge.func({
    assemblyFile: "dlls\\SDES-DLL.dll",
    typeName: "SDES.Class1",
    methodName: "Encrypt"
  });
  var parameters = {
    data: req.body.text,
    password: password
  };
  encrypt(parameters, function (error, result) {
    if (error) throw error;
    let message = new messageCollection({
      transmitter: req.body.transmitter,
      receiver: req.body.receiver,
      date: req.body.date,
      text: result
    });

    message.save(function (error, saved) {
      if (error) {
        res.json({ valid: false });
      } else {
        if (saved) {
          console.log('Se guardó correctamente el elemento');
          console.log(saved);
          res.json({ valid: true });
        }
      }
    });

  });
});

//Meotodo que retorna toda la lista de usarios
// Se espera recibir algo como lo siguiente

router.get('/users', function (req, res, next) {
  console.log('entro a /users')
  let users = [];

  userCollection.find({}, function (err, found) {
    for (var u in found) {
      users.push({
        name: found[u].name,
        id: found[u].userName
      });
      res.json(users);
    }
  });

  /* let users = [
    {
      name : "usuario 1",
      id : "fasdfasf",
    },
    {
      name : "usuario 1",
      id : "fasdfasf",
    }
  ]
  */

});

//similar a usuarios... se espera recibir  algo como esto

router.get('/messages', function (req, res, next) {
  console.log('Entró a messages');
  //Necesito conocer al usuario del cual quiero encontrar esos mensajes
  let userTransmitter = 'juan'; //esta variable supongo que me la has de mandar
  let userReceiver = 'pepe';
  let myMessages = [];
  console.log('Empezó la búsqueda');
  //{ $or: [{ transmitter: user1, receiver: user2 }, { transmitter: user2, receiver: user1 }] 

  var decrypt = edge.func({
    assemblyFile: "dlls\\SDES-DLL.dll",
    typeName: "SDES.Class1",
    methodName: "Decrypt"
  });

  
  messageCollection.find({ transmitter: userTransmitter, receiver: userReceiver }, null, { sort: { date: -1 } }, function (error, found) {
    for (var m in found) {
      console.log(m);
      console.log(found[m]);
      var parameters= { data: found[m].text, password: password };

      decrypt(parameters, function (error, result) {
        if (error) throw error;
        console.log('algunos decifrados');
        console.log(result);
        myMessages.push({
          transmitter: found[m].transmitter,
          receiver: found[m].receiver,
          date: found[m].date,
          text: result
        })
      });
    }
  });
  
});


module.exports = router;