var express = require('express');
var router = express.Router();
var edge = require('edge');
var User = require('../models/user'); 
const jwt = require('jsonwebtoken');
const passphrase = "xadfgbhknmkkhgrcbklkmopknnhvvffxjg";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('inicio', { title: 'Inicio' });
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Registrarse' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'iniciar secion' });
});

router.get('/inicio', function(req, res, next) {
  res.render('inicio', { title: 'Inicio' });
});

router.post('/signup', function(req, res){
console.log('dentro de suscribirse..');
var encrypt = edge.func({
  assemblyFile: "dlls\\SDES-DLL.dll",
  typeName: "SDES.Class1",
  methodName: "Encrypt"
});
var parameters = {
  data: req.body.password,
  password: passphrase
};

encrypt(parameters, function (error, result) {
  if (error) throw error;
  console.log('este es el result');
  console.log(result);
  var newUser = new User();
  newUser.userName = req.body.username;
  newUser.name = req.body.nombre;
  newUser.password = result;

  newUser.save(function (error, saved) {
    if (error) {
      console.log('cayó en un error');
      console.log(err);
      return res.status(500).send();
    } else {
      if (saved) {
        console.log('Ingresado exitosamente el elemento')
        console.log(saved);
        return res.status(200).send(); 
      }
    }
  });

});
})

router.post('/login', function(req, res){
  var userName = req.body.username;
  var password = req.body.password;

  User.findOne({userName: userName, password: password}, function(err, user){
    if(err){
      console.log(err);
      res.json({valid : false});
    }
    if(!user){
      res.json({ valid: false});
    }
    res.json({data : valid, token: jwt.sign({id : user.userName, name: user.name})}, passphrase);
  })
});

module.exports = router;