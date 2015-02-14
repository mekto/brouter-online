var express = require('express');
var swig = require('swig');
var app = express();


app.use(express.static('public'));
app.engine('html', swig.renderFile);
app.set('views', __dirname);
app.set('view engine', 'html');


app.get('/', function(req, res) {
  res.render('index');
});


module.exports = app;
