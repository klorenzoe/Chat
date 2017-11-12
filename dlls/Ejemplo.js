var express = require('express');
var edge = require('edge')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var RESULTS ="";
  var bye = edge.func({
    assemblyFile:"dlls\\DLL-Hello word.dll",
    typeName:"DLL_Hello_word.Class1",
    methodName: "GetGoodBye"
  });
  bye('JavaScript', function (error, result) {
    if (error) throw error;
    RESULTS = 'GoodBye--> '+ result;
  })

  var hello = edge.func({
    assemblyFile:"dlls\\DLL-Hello word.dll",
    typeName:"DLL_Hello_word.Class1",
    methodName: "GetHello"
  });

  
  hello(null, function(error, result){
    if (error) throw error;
    RESULTS += '|| Hello--> '+ result;
  });

  res.send(RESULTS);
});

module.exports = router;
