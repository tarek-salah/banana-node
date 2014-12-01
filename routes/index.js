var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: 'Express'
  });
});

router.get('/solr/*', function(req, res) {
  proxy.web(req, res, {
    target: 'http://' + proxyOptions.host + ':' + proxyOptions.port
  });
});

module.exports = router;