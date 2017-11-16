var express = require('express');
var router = express.Router();
var User = require('../models/users'); 
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

  var newUser = new User();
  newUser.userName = req.body.username;
  newUser.name = req.body.nombre;
  newUser.password = req.body.password;; //hay que cifrar aqui

  newUser.save(function(err, user){
    if(err){
      console.log(err);
      return res.status(500).send();
    }
    console.log('Ingresado exitosamente')
    return res.status(200).send();  
  });
  res.json({ valid: true });
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