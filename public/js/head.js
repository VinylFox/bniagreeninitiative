var $socket = io();
var $urls = [];
var $dims = [];
var $tags = [];
var $index = 0;
var $img_data = {};
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






//autoresize_hoodinfo();
//$(window).on('resize', function () {
//    autoresize_hoodinfo();
//});
//make_hoodinfo_collapsible();