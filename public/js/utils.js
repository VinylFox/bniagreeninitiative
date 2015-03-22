function autoresize_hoodinfo() {
    var pd_width = $('#propdetails').outerWidth();
    var win_width = $(window).width();
    var pd_offset_left = win_width - pd_width;
    var margin_left = $('#hoodinfo').offset().left;
    var margin_right = margin_left;
    var padding_left = parseInt($('#hoodinfo').css('padding-left'));
    var padding_right = parseInt($('#hoodinfo').css('padding-right'));
    var padding_left = parseInt($('#hoodinfo').css('padding-left'));
    var border_left = parseInt($('#hoodinfo').css('border-left-width'))
    var border_right = parseInt($('#hoodinfo').css('border-right-width'));
    var new_width = pd_offset_left - margin_left - margin_right - padding_left - padding_right - border_left - border_right;
    console.log(new_width);
    $('#hoodinfo').width(new_width);
    $('#hoodinfo_placeholder').width(new_width);
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


autoresize_hoodinfo();
$(window).on('resize', function () {
    autoresize_hoodinfo();
});
make_hoodinfo_collapsible();