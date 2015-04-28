var express = require('express');
var bodyParser = require('body-parser');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

var fixtures = {};

var app = express();

app.use(bodyParser.json());
app.use(allowCrossDomain);

app.post('/fixtures', function (req, res) {
    fixtures[req.body.request] = req.body.response;
});

app.get('*', function(req, res) {
    var response = fixtures[req.url];
    if (!response) {
        res.status(404).send("expected request url not received");
    } else {
        res.status(response.status).send(response.body);
    }

});

var server = app.listen(1337, function() {});

module.exports = server;