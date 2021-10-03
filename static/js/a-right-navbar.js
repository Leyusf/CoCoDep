function right_nav_bar_init(){
    if(jQuery("#right_nav_bar_scroll").length>0){
        jQuery("#right_nav_bar_scroll").waypoint({
            handler: function(direction) {
                if(direction=="down"){
                    jQuery(".right_nav_bar").show();
                }else{
                    jQuery(".right_nav_bar").hide();
                }
            },
            offset: "0",
        })
    }

    var bgcolor = jQuery(".right_nav_bar").attr("data-bgcolor");
    var hovercolor = jQuery(".right_nav_bar").attr("data-hovercolor");
    var data_pop= jQuery(".right_nav_bar").attr("data-pop");
    jQuery(".right_nav_bar .icons").each(function(){
        var title = jQuery(this).attr("data-desc");
        var $this = jQuery(this);
        var imageurl = jQuery(this).attr("data-file");
        if(imageurl){

            var tiptitle="<img src='"+imageurl+"'  style='width:150px;height:150px;'/><div style='width:150px;text-align:center;overflow:hidden;margin-top:5px;'>"+title+"</div>";
            if(jQuery(this).find(".title").html()=="" || jQuery(this).find(".title").length==0){
                var data = { tipJoint: "right", fixed:true,offset:[-50,0],style: data_pop };
                jQuery("<img />").attr("src", imageurl).load(function(){
                    setTimeout(function(){new Opentip( $this, tiptitle, data);},1500);
                })

            }

        }
    }).mouseenter(function(){
        if(jQuery(this).find(".title").html()!="" && jQuery(this).find(".title").length>0){
            var width = jQuery(this).find(".title").css("width");
            width = width.replace("px","");
            jQuery(this).animate({width:(width*1+64)+"px"},200);
        }
        var tmpcolor = jQuery(this).attr("data-hovercolor");
        if(!tmpcolor) tmpcolor = hovercolor;

        jQuery(this).css({background:tmpcolor});
    }).mouseleave(function(){
        if(jQuery(this).find(".title").html()!="" && jQuery(this).find(".title").length>0){
            jQuery(this).animate({width:"54px"},200);
        }
        var tmpcolor = jQuery(this).attr("data-color");
        if(!tmpcolor) tmpcolor = bgcolor;

        jQuery(this).css({background:tmpcolor});
    });
    jQuery(".right_nav_bar .totop-icon").click(function(e){
        e.preventDefault();
        jQuery("html, body").animate({ scrollTop: 0 }, "slow");
        return false;
    })
}