var $socket = io();
var $urls = [];


function resize_propdetails(){
    var top_margin = 25;
    var bot_margin = 25;
    var mast_height = $(".masthead").height();
    var foot_height = $('#footer').height();
    var offset_top = top_margin + mast_height;
    var offset_bot = bot_margin + foot_height;
    var win_height = $(window).height();
    var new_height = win_height - offset_bot - offset_top;
    $('#propdetails').height(new_height);
}

function autoresize_propdetails(){
    resize_propdetails();
    $(window).on('resize', function () {
        resize_propdetails();
    });
}






//autoresize_hoodinfo();
//$(window).on('resize', function () {
//    autoresize_hoodinfo();
//});
//make_hoodinfo_collapsible();