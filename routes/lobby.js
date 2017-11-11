var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');
const password = Math.random().toString(36).replace(/[^a-z]+/g, '');

/* Database */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat', function (err) {
  if (!err)console.log('se conectó la base de datos MongoDB chat');
  
});
const messageCollection = require('../models/message');
const userCollection = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('lobby');
});


//Se genera un token de prueba para poder trabajar "como si ya hubiera iniciado sesion"
router.get('/generate', function (req, res, next) {
  console.log("generando token")
  res.json({ token: jwt.sign({ name: req.query.user }, password) });
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
  res.render('chat', { friend: req.params.user });
});

//Metodo que envia el mensaje
router.post('/send', function (req, res, next) {
  let message = new messageCollection(req.body);
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


  // si no se pudo guardar
  // res.json({valid: false});
});

//Meotodo que retorna toda la lista de usarios
// Se espera recibir algo como lo siguiente

router.get('/users', function (req, res, next) {
  console.log('entro a /users')
  let users = [];

  userCollection.find({}, function (err, found) {
    for (var user in found) {
      users.push({
        name: user.userName,
        id: user._id //por el momento mando el Id que mongo le adiere por default
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
  let user = 'juan'; //esta variable supongo que me la has de mandar
  let myMessages = [];
  messageCollection.find({ userName: user }, function (error, found) {
    for (var m in found) {
      console.log('encontró');
      console.log(found)
      myMessages.push({
        transmitter: m.transmitter,
        reciever: m.reciever,
        date: m.date,
        text: m.text
      })
    }
    console.log('encontró');
    res.json(myMessages);
    console.log(myMessages);
  });
  /*  let users = [
    {
      transmitter: "usuario 1",
      reciever: "usuario amigo de 1",
      date: 13545132,
      text: "kjasdfjlkasjklf"
    }
  ]
  */
});


module.exports = router;