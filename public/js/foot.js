


$socket.on("srv_transfer_approved_image_url",function(url){
    console.log("GOT URL");
    divstr = "<div class=\"img_cont\"><img src=\"" + url + "\" class=\"car_img\"/></div>";
    $('#carousel').append(divstr);

});

$socket.on("srv_end_approved_image_data_transfer", function(){
    console.log("I FINISHED");
    $('#carousel').slick({
        'slidesToShow':8,
        'centerMode':false,
        'arrows':true,
        'infinite':true
    });
});

autoresize_propdetails();
$socket.emit("clt_request_approved_image_data","");