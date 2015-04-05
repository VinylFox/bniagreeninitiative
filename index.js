var express = require('express');
var Api = require('./app/api.js');
var app = express();
var fs = require('fs');
var http = require('http').Server(app);
var io = require('./app/images.js')(http);

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/bniagreeninitiative';

app.set('view engine', 'jade');

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
    case "refinements":
      api.refinements(req, res, function(resp) {
        var respa = {
          data: []
        };
        resp.data.forEach(function(val) {
          if (val._id) {
            var vals = val._id.split(', ');
            vals.forEach(function(vala) {
              if (respa.data.indexOf(vala) == -1) {
                respa.data.push(vala);
              }
            });
          }
        });
        res.json(respa);
      }, req.query.type, req.query.field);
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

http.listen(process.env.PORT || 5000, function() {
  console.log("App listening on " + (process.env.PORT || 5000));
});