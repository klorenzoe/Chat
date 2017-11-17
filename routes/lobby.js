var express = require('express');
var router = express.Router();
var edge = require('edge');
const jwt = require('jsonwebtoken');
var fileSystem = require('fs');
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
  if (!req.files.userFile) {
    res.json({ valid: false });
    return;
  }
  console.log(req.files.userFile);
  req.files.userFile.mv('./public/files/' + req.files.userFile.name, function (error) {
    let Compressor = edge.func({
      assemblyFile: "dlls\\HuffmanEncoding.dll",
      typeName: "HuffmanEncoding.Huffman",
      methodName: "Compressor"
    });
    console.log('public\\files\\' + req.files.userFile.name);
    Compressor('public\\files\\' + req.files.userFile.name, function (error, result) {
      console.log('Dentro del callback de compressor');
      if (error) throw error;
      res.json({ valid: true, name: result });
    });
  });

  //.parse enviarselo al huffman y guardarlo en el .mv el archivo comprimido

});

//Se valida el token del usuario
router.get('/validate', function (req, res, next) {
  try {
    console.log(req.body.token);
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
  if (req.body.isFile===true) {
    let message = new messageCollection({
      transmitter: req.body.transmitter,
      receiver: req.body.receiver,
      date: req.body.date,
      text: req.body.text,
      isFile: true
    });
    message.save(function (error, saved) {
      if (error) {
        res.json({ valid: false });
      } else {
        if (saved) {
          console.log('es un archivo y esto fue lo que guardó');
          console.log(saved);
          res.json({ valid: true });
        }
      }
    });
  } else {

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
        text: result,
        isFile: false
      });

      message.save(function (error, saved) {
        if (error) {
          res.json({ valid: false });
        } else {
          if (saved) {
            console.log('es un mensaje y esto fue lo que guardó');
            console.log(saved);
            res.json({ valid: true });
          }
        }
      });
    });
  }

});

//Meotodo que retorna toda la lista de usarios
// Se espera recibir algo como lo siguiente

router.get('/users', function (req, res, next) {
  console.log('entro a /users')
  let users = [];
  userCollection.find({ userName: { $ne: req.query.id } }, function (err, found) {
    for (var u in found) {
      users.push({
        name: found[u].name,
        id: found[u].userName
      });
    }

    res.json(users).end();
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
  let userTransmitter = req.query.transmitter; //esta variable supongo que me la has de mandar
  let userReceiver = req.query.receiver;
  let myMessages = [];
  console.log('Empezó la búsqueda');
  //{ $or: [{ transmitter: user1, receiver: user2 }, { transmitter: user2, receiver: user1 }]} 

  var decrypt = edge.func({
    assemblyFile: "dlls\\SDES-DLL.dll",
    typeName: "SDES.Class1",
    methodName: "Decrypt"
  });

  userTransmitter = req.query.transmitter;
  userReceiver = req.query.receiver;
  messageCollection.find({ $or: [{ transmitter: userTransmitter, receiver: userReceiver }, { transmitter: userReceiver, receiver: userTransmitter }] }, null, { sort: { date: -1 } }, function (error, found) {
    console.log('found');
    console.log(found);
    for (var m in found) {
      console.log(m);
      if (found[m].isFile) {
        myMessages.push({
          transmitter: found[m].transmitter,
          receiver: found[m].receiver,
          date: found[m].date,
          text: found[m].text,
          isFile: true
        })
      } else {
        var parameters = { data: found[m].text, password: password };
        decrypt(parameters, function (error, result) {
          if (error) throw error;
          console.log('algunos decifrados');
          console.log(result);

          myMessages.push({
            transmitter: found[m].transmitter,
            receiver: found[m].receiver,
            date: found[m].date,
            text: result,
            isFile: false
          }); //push
        });//decrypt
      };//if
    };//for
    res.json({ valid: true, messages: myMessages });
  });

});

router.get('/download/:name', function (req, res, next) {
  //descomprimir archivos
  //'public\\files\\' + req.params.name
  let Decompress = edge.func({
    assemblyFile: "dlls\\HuffmanEncoding.dll",
    typeName: "HuffmanEncoding.Huffman",
    methodName: "Descompressor"
  });
  Decompress('public\\files\\' + req.params.name, function (error, result) {
    if (error) {
      console.log('el archivo ya no se encuentra en el servidor');
    } else {
      res.download('public\\files\\' + result, function (error) {
        fileSystem.unlink('public\\files\\' + result);
        console.log('Descargado correctamente')
      });
    }
  });
});

router.get('/search/:word', function (req, res, next) {
  //Envian una palabra, cifro esa palabra y despues busco todos los mensajes con esa palabra.
  //retornon una lista.
  let myMessages = [];
  let encrypt = edge.func({
    assemblyFile: "dlls\\SDES-DLL.dll",
    typeName: "SDES.Class1",
    methodName: "Encrypt"
  });

  encrypt({ data: req.params.word, password: password }, function (err, search) {
    messageCollection.find({ $or: [{ message: { $regex: '^' + search } }, { message: { $regex: search + '^' } }, { message: { $regex: '^' + search + '^' } }, { message: search }] }, function (error, found) {
      if (error) {
        throw error
      } else {
        let decrypt = edge.func({
          assemblyFile: "dlls\\SDES-DLL.dll",
          typeName: "SDES.Class1",
          methodName: "Decrypt"
        });

        for (var m in found) {
          decrypt({ data: found[m].text, password: password }, function (er, result) {
            myMessages.push({
              transmitter: found[m].transmitter,
              receiver: found[m].receiver,
              date: found[m].date,
              text: result,
              isFile: false
            }); //push
          });//decrypt
        }; //for
      }; //else
    });//found
  });//encrypt
});





module.exports = router;