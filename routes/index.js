var express = require('express');
var router = express.Router();
var v1 = require('./v1')

router.use('/api/v1', v1);
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});



module.exports = router;
