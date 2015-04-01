

$socket.on("srv_transfer_approved_image_url",function(url){
    console.log("GOT URL");
    //divstr = "<div class=\"img_cont\"><img src=\"" + url + "\" class=\"car_img\"/></div>";
    $urls.push(url);

});

$socket.on("srv_end_approved_image_data_transfer", function(){
    var tags = [];
    for(var i = 0; i < $urls.length; i++){
        tags.push(i);
    }
    var slider = append_slider('my_slider','#footer',$urls,tags);
});

autoresize_propdetails();
$socket.emit("clt_request_approved_image_data","");