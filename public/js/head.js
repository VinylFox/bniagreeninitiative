var $socket = io();
var $urls = [];
var $dims = [];
var $tags = [];
var $index = 0;
var $img_data = {};
var $slider;
$img_data.CG = {};
$img_data.SW = {};


function resize_propdetails(){
    var top_margin = 20;
    var bot_margin = 20;
    var mast_height = $(".masthead").height();
    var foot_height = $('#footer').height();
    var pad_top = parseInt($('#propdetails').css('padding-top'));
    var pad_bot = parseInt($('#propdetails').css('padding-bottom'));
    var offset_top = top_margin + mast_height + pad_top;
    var offset_bot = bot_margin + foot_height + pad_bot;
    var win_height = $(window).height();
    var new_height = win_height - offset_bot - offset_top;
    $('#propdetails').height(new_height);
    $('#propdetails').css('top',mast_height + top_margin + 'px');
}

function autoresize_propdetails(){
    resize_propdetails();
    $(window).on('resize', function () {
        resize_propdetails();
    });
}

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
    $slider = append_slider('my_slider','#footer',$urls,tags,$dims,$tags);
});

$socket.emit("clt_request_approved_image_data","");

