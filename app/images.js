module.exports = function(http){
    var io = require('socket.io')(http);
    var cloudinary = require('cloudinary');

    var $cloud_name = "bnia-jfi"; //process.env.CLOUD_NAME ||
    var $cloud_key =  "334193561318986"; //process.env.CLOUD_KEY ||
    var $cloud_secret = "UlIFjo15Cm-33f3rBa9G4j1GqiY"; //process.env.CLOUD_SECRET ||

    var $image_height = 200;

    cloudinary.config({
        cloud_name: $cloud_name,
        api_key: $cloud_key,
        api_secret: $cloud_secret
    });

    io.sockets.on('connection', function(socket) {
        console.log('connect_attempt');
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
    return io;
};




