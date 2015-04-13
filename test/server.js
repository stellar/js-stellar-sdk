var express = require('express');
var bodyParser = require('body-parser');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

var app = express();

app.use(bodyParser.json());
app.use(allowCrossDomain);

app.get('/', function(req, res) {
  res.status(200).send("hi");
});

// app.use(express.static(__dirname + '/../'));

var server = app.listen(3000, function() {});

module.exports = server;