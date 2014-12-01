var express = require('express');
path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var fs = require("fs")

config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

httpProxy = require('http-proxy')
proxyOptions = {
  host: config.solr.address,
  port: config.solr.port
};
proxy = httpProxy.createProxyServer(proxyOptions);


var bodyParser = require('body-parser');

var routes = require('./routes/index');
var solr = require('./routes/solr');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.post('/solr/*', function(req, res) {
  proxy.web(req, res, {
    target: 'http://' + proxyOptions.host + ':' + proxyOptions.port
  });
})
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;