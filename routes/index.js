var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send(jwt.sign({name : "juan"},'pepePassword'));
});

module.exports = router;
