/*function autoresize_hoodinfo() {
    var pd_width = $('#propdetails').outerWidth();
    var win_width = $(window).width();
    var pd_offset_left = $('#propdetails').offset().left;
    var margin_left = 20;
    var margin_right = margin_left;

    var padding_left = parseInt($('#hoodinfo').css('padding-left'));
    var padding_right = parseInt($('#hoodinfo').css('padding-right'));
    var padding_left = parseInt($('#hoodinfo').css('padding-left'));
    var border_left = parseInt($('#hoodinfo').css('border-left-width'));
    var border_right = parseInt($('#hoodinfo').css('border-right-width'));
    var new_left = pd_offset_left +  margin_left + pd_width + padding_left + padding_right + border_left + border_right;
    var new_width = win_width - new_left - margin_right*2;
    $('#hoodinfo').css('left', new_left + "px");
    $('#hoodinfo').width(new_width);

}*/

function autoresize_propdetails(){
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

function make_hoodinfo_collapsible() {
    $('#hoodinfo').click(function () {
        $(this).slideToggle('slow');
        $('#hoodinfo_placeholder').slideToggle('slow');
    });
    $('#hoodinfo_placeholder').click(function () {
        $(this).slideToggle('slow');
        $('#hoodinfo').slideToggle('slow');
    });
}

autoresize_propdetails();
$(window).on('resize', function () {
    autoresize_propdetails();
});


//autoresize_hoodinfo();
//$(window).on('resize', function () {
//    autoresize_hoodinfo();
//});
//make_hoodinfo_collapsible();