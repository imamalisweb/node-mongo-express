const express = require('express');

const router = express.Router();
var  mainstart = require('../start');


router.get('/', (req, res) => {
  //res.send('It works!');
  console.log(mainstart.getsysstat )
  res.render('form', { title: 'fffff'});

});

module.exports = router;