var express = require('express');
var router = express.Router();
var edge = require('edge');
var User = require('../models/user'); 
const jwt = require('jsonwebtoken');
const passphrase = "xadfgbhknmkkhgrcbklkmopknnhvvffxjg";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login');
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.get('/login', function(req, res, next) {
  res.render('login');
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
      res.json({valid : false});
    } else {
      if (saved) {
        console.log('Ingresado exitosamente el elemento')
        console.log(saved);
        res.json({valid : true, token : jwt.sign({id : req.body.username, name: req.body.nombre})}, passphrase);
      }
    }
  });

});
})

router.post('/login', function(req, res){
  var userName = req.body.username;
  var password = req.body.password;

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
    User.findOne({userName: userName, password: result}, function(err, user){
      if(err){
        console.log(err);
        res.json({valid : false, message: "Hemos cometido un error y no podemos iniciar sesión."});
      }
      if(!user){
        res.json({ valid: false, message : "Los datos ingresados no son válidos."});
      }
      res.json({valid : true, token : jwt.sign({id : user.userName, name: user.name})}, passphrase);
    })
  });
  res.json({valid : false, message: "Hemos cometido un error y no podemos iniciar sesión."});
});

module.exports = router;