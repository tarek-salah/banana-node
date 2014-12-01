var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
	console.log(req.url)
	proxy.web(req, res, {
		target: 'http://' + proxyOptions.host + ':' + proxyOptions.port
	});
});

router.post('/', function(req, res) {
	proxy.web(req, res, {
		target: 'http://' + proxyOptions.host + ':' + proxyOptions.port
	});
})
module.exports = router;