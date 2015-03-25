var express = require('express');
var Api = require('./app/api.js');
var app = express();
var fs = require('fs');
var http = require('http').Server(app);
var io = require('socket.io')(http);

/** NEED TO FIND A WAY TO NOT STORE THIS STUFF IN CODE **/
var $cloud_name = "dhoj0tmte";
var $cloud_key = "711233532133578";
var $cloud_secret = "SF3sNnow9Q98RfciZSBUZD5PlCk";

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/bniagreeninitiative';

app.set('view engine', 'jade');

app.set('port', (process.env.PORT || 5000));

app.use('/public', express.static(__dirname + '/public'));

app.use(express.static(__dirname + '/public'));

app.get('/api/:type', function(req, res) {
  var api = new Api({
    mongoUri: mongoUri
  });
  var cb = function(resp) {
    res.json(resp);
  };
  switch (req.params.type) {
    case "watersheds":
      api.watersheds(req, res, cb);
      break;
    case "neighborhoods":
      api.neighborhoods(req, res, cb);
      break;
    case "sites":
      api.sites(req, res, cb);
      break;
    default:
      cb({
        data: [],
        results: 0,
        success: false,
        error: ['API method unknown']
      });
  }
});

app.get('/', function(request, response) {
  response.render('index');
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

http.listen(app.get('port'), function(){console.log("http listening on " + app.get('port'))});