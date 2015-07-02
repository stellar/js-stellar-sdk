var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');

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

app.post('/clear', function (req, res) {
    fixtures = {};
    res.status(200).send();
});

/**
* Will register the path name in a map as an expected url to be requested soon.
* It will also store the query parameters and make sure that the eventual request
* also contains them.
*/
app.post('/fixtures', function (req, res) {
    var parse = url.parse(req.body.request, true);
    var pathname = parse.pathname;
    var query = parse.query;
    req.body.response.query = query;
    if (req.body.stream) {
        req.body.response.stream = true;
    }
    fixtures[pathname] = req.body.response;
    res.status(200).send({"test": "test"});
});

/**
* Will check that the given request path matches an expected request path in the fixtures map.
* If it matches, will also check that any query parameters that were expected are also passed.
*/
app.all('*', function(req, res) {
    var response = fixtures[req._parsedUrl.pathname];
    if (!response) {
        res.status(404).send("unexpected request url path: " + req._parsedUrl.pathname);
        return;
    }
    if (response.query) {
        var keys = Object.keys(response.query);
        for (var i = 0; i < keys.length; i++) {
            if (req.query[keys[i]] !== response.query[keys[i]]) {
                res.status(404).send("query parameter \"" + keys[i] + "\" was: " + req.query[keys[i]] + "; expected: " + response.query[keys[i]]);
                return;
            }
        }
    }
    if (response.stream) {
        if (req.headers.accept != "text/event-stream") {
            res.status(404).send("expected a event stream request");
            return;
        }
        res.writeHead(200, {"Content-Type":"text/event-stream", "Cache-Control":"no-cache", "Connection":"keep-alive"});
        res.write("data: " + response.body + "\n\n");
        res.end()
    } else {
        res.status(response.status).send(response.body);
    }

});

var server = app.listen(1337, function() {});

module.exports = server;
