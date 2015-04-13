var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.status(200).send("hi");
});

// app.use(express.static(__dirname + '/../'));

var server = app.listen(3000, function() {});

module.exports = server;