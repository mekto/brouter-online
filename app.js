var express = require('express');
var swig = require('swig');
var app = express();


app.use(express.static('public'));
app.engine('html', swig.renderFile);
app.set('views', __dirname);
app.set('view engine', 'html');


app.all('*', function(req, res, next) {
  console.log(req.method, req.url, new Date());
  next();
});

app.get('/', function(req, res) {
  res.render('index');
});


module.exports = app;
