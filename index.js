var express = require('express');
var Api = require('./app/api.js');
var app = express();
var fs = require('fs');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cloudinary = require('cloudinary');

var $cloud_name = process.env.CLOUD_NAME || "bnia-jfi";
var $cloud_key = process.env.CLOUD_KEY || "334193561318986";
var $cloud_secret = process.env.CLOUD_SECRET || "UlIFjo15Cm-33f3rBa9G4j1GqiY";

var $image_height = 200;

cloudinary.config({
  cloud_name: $cloud_name,
  api_key: $cloud_key,
  api_secret: $cloud_secret
});

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

io.on('connection', function(socket) {
  socket.on("clt_request_approved_image_data", function(d) {
    var images = cloudinary.api.resources_by_tag("app_y", function(result) {
      var res = result.resources;
      for (var i = 0; i < res.length; i++) {
        var url = res[i].url;
        url = url.replace('upload/','upload/h_' + $image_height +'/');
        var width = res[i].width;
        var height = res[i].height;
        var dims = {'width':width,'height':height};
        var tags = res[i].tags;
        var site = ""
        var type = "";
        for(var j=0; j < tags.length; j++){
          if(tags[j].indexOf('type') > -1){
            type = tags[j].replace('type_','').toUpperCase();
          }
          if(tags[j].indexOf('site') > -1){
            site = tags[j].replace('site_','').toUpperCase();
          }
        }
        ret = {'url':url,'height':height,'width':width,'type':type,'site':site};
        socket.emit("srv_transfer_approved_image_data", ret);
      }
      socket.emit("srv_end_approved_image_data_transfer", "");
    }, {
      tags: true, max_results:500
    });
  });
});

http.listen(process.env.PORT || 5000, function() {
  console.log("App listening on " + (process.env.PORT || 5000));
});