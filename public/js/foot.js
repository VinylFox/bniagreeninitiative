

$socket.on("srv_transfer_approved_image_data",function(data){
    $urls.push(data.url);
    $dims.push({'width':parseInt(data.width),'height':parseInt(data.height)});
    var tag = index + data.site;
    $tags.push(tag);
    if($img_data[data.type][data.site] == undefined){
            $img_data[data.type][data.site] = [];
        }
    $img_data[data.type][data.site].push({'url':data.url, 'tag':tag});
});

$socket.on("srv_end_approved_image_data_transfer", function(){
    var tags = [];
    for(var i = 0; i < $urls.length; i++){
        tags.push(i);
    }
    var slider = append_slider('my_slider','#footer',$urls,tags,$dims,$tags);
});

autoresize_propdetails();
$socket.emit("clt_request_approved_image_data","");