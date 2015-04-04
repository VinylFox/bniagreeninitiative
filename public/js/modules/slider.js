function append_slider(id,container_id,img_srcs,tags,img_dims){
    var pic_margin = 10;
    var data,root,cont,slider,left,center,right,carousel,frames,pics,fdims,right_limit,current_pos;
    if(img_dims == undefined){get_img_dims();}else{initialize();}
    function get_img_dims(){
        img_dims = [];
        var pl = new preLoader(img_srcs,{
            onProgress:function(src,element,index){
                dims = {
                    "width":element.naturalWidth,
                    "height":element.naturalHeight
                };
                img_dims.push(dims);
            },onComplete:function(){
                initialize();
            }
        });
    }
    function get_scaled_width(scale_h,img_dims){
        var scaler = scale_h / img_dims.height;
        var scaled_width = scaler*img_dims.width;
        return scaled_width;
    }
    function initialize(){
        data = {};
        for(var i=0; i < img_srcs.length; i++){
            data[tags[i]] = {};
            data[tags[i]].src = img_srcs[i];
            data[tags[i]].dims = img_dims[i];
            data[tags[i]].scaled_width = {};
            data[tags[i]].hidden = false;
            data[tags[i]].true_width = null;
            data[tags[i]].pos = 0;
            data[tags[i]].index = i;
        }

        for(var i=0; i < img_srcs.length; i++){
            if(i==0){
                root = data[tags[i]];
            }
            if(i>0){
                data[tags[i]].prev = data[tags[i-1]];
            }
            else{
                data[tags[i]].prev = false;
            }
            if((i+1) < img_srcs.length){
                data[tags[i]].next = data[tags[i+1]];
            }
            else{
                data[tags[i]].next = false;
            }
        }

        cont = d3.select(container_id);
        slider = cont.append('div')
            .attr('id',id)
            .attr('class','slider');
        left = slider.append('div')
            .attr('class','slider_element slider_button slider_left');
        right = slider.append('div')
            .attr('class','slider_element slider_button slider_right');
        center = slider.append('div')
            .attr('class','slider_element slider_center');


        carousel = center.append('div')
            .attr('class','slider_carousel')
            .style('visibility','hidden');
        var mock_frame = carousel.append('div').attr('class','slider_carousel_frame');
        fdims = {};
        fdims.pad_left = parseInt(mock_frame.style('padding-left'));
        fdims.pad_right = parseInt(mock_frame.style('padding-right'));
        fdims.height = parseInt(mock_frame.style('height'));
        fdims.margin = pic_margin;
        mock_frame.remove();

        for(var i=0; i < img_srcs.length; i++){
            data[tags[i]].scaled_width = parseInt(get_scaled_width(fdims.height,data[tags[i]].dims));
            data[tags[i]].true_width = data[tags[i]].scaled_width + fdims.pad_left + fdims.pad_right +fdims.margin;
        }
        var current_node = root;
        while(current_node != false){
            if(current_node.prev!=false){
                current_node.pos = current_node.prev.pos + current_node.prev.true_width;
            }
            if(current_node.next == false){
                right_limit = current_node.pos;
            }
            current_node = current_node.next;
        }

        frames = carousel.selectAll('slider_carousel_frame')
            .data(tags)
            .enter()
            .append('div')
            .attr('class','slider_carousel_frame')
            .style('width',function(d){return data[d].scaled_width + 'px';})
            .style('left',function(d){return data[d].pos + 'px';})
        pics = frames.append('img')
            .attr('class','slider_carousel_pic')
            .attr('src',function(d){return data[d].src})
            .style('width',function(d){return data[d].scaled_width + 'px'})


        current_pos = 0;

        bind_buttons();
        bind_keys();
        set_update_loop(1000);
    }

    function hide_node(tag){
        var hidden_node = data[tag];
        if(hidden_node == undefined){return false;}
        if(hidden_node.hidden == true){return false;}
        hidden_node.hidden = true;
        var pos_change = hidden_node.true_width;
        var current_node = hidden_node.next;
        while(current_node!= false){
            current_node.pos-=pos_change;
            current_node = current_node.next;
        }
    }

    function show_node(tag){
        var shown_node = data[tag];
        if(shown_node == undefined){return false;}
        if(shown_node.hidden == false){return false;}
        shown_node.hidden = false;
        var pos_change = shown_node.true_width;
        var current_node = shown_node.next;
        while(current_node !=false){
            current_node.pos+=pos_change;
            current_node = current_node.next;
        }
    }

    function display_set(tag_set){
        for(var i=0; i < tag_set.length; i++){
            tag_set[i] = String(tag_set[i]);
        }
        for(var i=0; i < tag_set.length; i++){
            show_node(tag_set[i]);
        }
        for(var i=0; i < tags.length; i++){
            if(tag_set.indexOf(String(tags[i])) == -1){
                hide_node(tags[i]);
            }
        }
    }

    function shift_left(pos_change){
        if(current_pos + pos_change > right_limit){
            return false;
        }
        current_pos+=pos_change;
        var current_node = root;
        while(current_node!=false){
            current_node.pos-=pos_change;
            current_node=current_node.next;
        }
    }

    function shift_right(pos_change){
        if(current_pos - pos_change < 0){
            return false;
        }
        current_pos-=pos_change;
        var current_node = root;
        while(current_node!=false){
            current_node.pos+=pos_change;
            current_node=current_node.next;
        }
    }

    function update(){
        var dur = 750;
        frames.transition().duration(dur).ease("cubic-out").style('left',function(d){
            return (data[d].pos + 'px');
        }).style('opacity',
            function(d){
                if(data[d].hidden == true){
                    return '0';
                }
                else{
                    return '1';
                }
            }).style('pointer-events',function(d){
                if(data[d].hidden == true){
                    return 'none';
                }
                else{
                    return 'auto';
                }
            })
    }

    function bind_keys(){
        d3.select('html').on("keydown",function(d){
            if(d3.event.keyCode=="39"){
                right.on('click')();
            }
            if(d3.event.keyCode=="37"){
                left.on('click')();
            }
        })
    }

    function bind_buttons(){
        left.on('click',function(){
            shift_left(500);
            update();
            left.transition().duration(100).style("background-color","#77AFD9");
            left.transition().delay(150).style("background-color","white");
        });

        right.on('click',function(){
            shift_right(500);
            update();
            right.transition().duration(100).style("background-color","#77AFD9");
            right.transition().delay(150).style("background-color","white");
        });
    }

    function set_update_loop(period){
        var s = setInterval(update, period);
        return s;
    }

    function add_click_event_function(fun){
        frames.on('click',function(d){
            fun(d);
        })
    }

    function show(){
        carousel.style('visibility','visible');
    }

    var ret = {};
    ret.hide_node = hide_node;
    ret.show_node = show_node;
    ret.update = update;
    ret.display_set = display_set;
    ret.show = show;
    ret.add_click_event_function = add_click_event_function;
    return ret;
}
