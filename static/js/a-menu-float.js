function floatmenu_create_init(){

    if(jQuery("#header.logo-left-right #navigation ul.ab-center").length>0){
        var v1 = jQuery("#header #branding").width();
        var v2 = jQuery("#header .assistive-info .top-bar-right").width();
        jQuery("#header #navigation #main-nav").css("text-align","center").css("left",(v2-v1)/2+"px");
    }
    var $ = jQuery;
    if($("#header.newrightmenu,#header.newleftmenu").length>0){
        if($("#page.bodyheader40,#page.bodyheader0").length>0){
            $("#header").css("position","fixed").css("top","0");
            return;
        }
    }



    /*!Floating menu*/
    if (smartMenu && $("#header").length>0 ) {
        var controlDiv = "";
        var mouseHtml = "";
        try{
            if(self!=top && !top.jQuery("body").hasClass("caterole")){
                var pcontroldiv = '<div class="controls-column bitPcontrols wf-mobile-hidden" style="top:50%;margin-top:-8px;"><div class="controls-out-tl"><div class="parent parent-vc_row active "><a class="control-btn"><span class="vc-btn-content vo-btn-nomove" style="padding:0 5px 0 10px !important;  line-height: 18px !important;font-size:12px !important;color:#fff;" onclick="top.qfFloatMenuSetting()">璁剧疆娴姩澶撮儴鍜孡OGO</span></a></div></div></div>';

                mouseHtml = 'onmouseover="document.getElementById(\'phantomFloatMenu\').style.display = \'block\';floatmenucontrols_mouseenter();" onmouseout="document.getElementById(\'phantomFloatMenu\').style.display = \'none\';floatmenucontrols_mouseout();"  ';
                controlDiv = '<div id="phantomFloatMenu"  style="line-height: 0px; opacity: 1; visibility: visible; transition: auto 0s ease 0s; display: none;" class="controls-element vc-controls bit-controls-element">'+pcontroldiv+'<div class="controls-cc"><a class="control-btn vc-element-name"><span class="vc-btn-content vo-btn-nomove">娴姩鑿滃崟鍜孡OGO</span></a><a class="control-btn control-btn-edit " onclick="top.qfFloatMenuSetting()" title="璁剧疆 娴姩鑿滃崟鏍峰紡"><span class="vc-btn-content"><span class="icon"></span></span></a></div></div>';
            }
        }catch(e){


        }

        var scrTop = 0,
            scrDir = 0,
            scrUp = false,
            scrDown = false,
            /*$header = $("#main-nav"),*/
            $header = $("#main-nav"),
            $headerSlide = $("#main-nav-slide .main-nav-slide-inner"),
            f_logoheight =  $("#main-nav").attr("data-lh"),
            f_maxwidth =  $("#main-nav").attr("data-mw"),
            f_fh =  $("#main-nav").attr("data-fh"),
            logoURL = $("#branding a").attr("href"),
            desc =  $("#bit-floatlogoText").html(),
            $parent = $header.parent(),
            $headerSlideParent = $headerSlide.parent(),
            $phantom = $('<div id="phantom" '+mouseHtml+' >'+controlDiv+'<div class="ph-wrap"><div class="ph-wrap-content"><div class="ph-wrap-inner"><div class="logo-box" ></div><div class="menu-box" ></div><div class="menu-info-box"  ></div></div></div></div></div>').appendTo("body"),
            $menuBox = $phantom.find(".menu-box"),
            $headerH = $header.height(),
            isMoved = false,
            breakPoint = 0,
            threshold = $("#header").offset().top + $("#header").height(),
            doScroll = false;
        var headerobj = $("#header>*");
        var header_height = jQuery("#header").height();


        if ($("#qfadminbar:visible").exists()) { $phantom.css("top", "28px"); };
        if ($("#page").hasClass("boxed")) { $phantom.find(".ph-wrap").addClass("boxed"); $phantom.addClass("boxed");}
        $phantom.find(".ph-wrap").addClass("with-logo");
        if (dtGlobals.logoURL && dtGlobals.logoEnabled) {
            //if(logoURL == undefined){
            if(dtGlobals.logoURL){
                var valign = jQuery(".floatlogoText").css("vertical-align");
                if(!valign) valign="middle";
                var img_str = "";
                if(logoURL){
                    img_str = '<a href="'+logoURL+'"><img src="'+dtGlobals.logoURL+'" height="'+dtGlobals.logoH+'" width="'+dtGlobals.logoW+'"></a>';
                }else{
                    img_str = '<img src="'+dtGlobals.logoURL+'" height="'+dtGlobals.logoH+'" width="'+dtGlobals.logoW+'">';
                }
                $phantom.find(".logo-box").html('<div style="height:48px;vertical-align: '+valign+';display: table-cell;" >'+img_str+'</div>');
            }
            //}else{
            //	$phantom.find(".logo-box").html('<img src="'+dtGlobals.logoURL+'" height="'+dtGlobals.logoH+'" width="'+dtGlobals.logoW+'"></a>');
            //}
        }else{
            $phantom.find(".ph-wrap").addClass("with-logo-no");
        }
        if(desc){
            $phantom.find(".logo-box").append(desc);
            $phantom.find(".with-logo-no .logo-box").css("display","table-cell");
        }
        if(f_logoheight >=10 &&f_logoheight<=50 ){
            $("#phantom .logo-box img").css("max-height",f_logoheight+"px");
        }
        if(f_fh==1 ){
            $("#phantom").addClass("min");
        }
        if(f_maxwidth>0 ){
            $("#phantom .ph-wrap .ph-wrap-content").css("max-width",f_maxwidth+"px");
        }
        var info_w = $("#phantom .menu-info-box").width();
        if(jQuery("#header.bit-logo-menu").length>0 && !$("#phantom").hasClass("bit-logo-menu")){
            var old_img_str = $header.find("#branding .logo img:first").attr("src");
            $header.find("#branding .logo img:first").css("width","auto");
            $("#phantom").addClass("bit-logo-menu").find(".logo-box").remove();
            $("#phantom .menu-box").css("padding-left",info_w+"px");
        }

        $(".one-page-row .logo-box a").on('click',function(e){
            $("body").addClass("is-scroll");
            if($("#phantom").css("display")=="block"){
                var floatMenuH = $("#phantom").height();
            }else{
                var floatMenuH = 0;
            }
            var $_this = $(this),
                selector 	= $_this.attr("href");

            var base_speed  = 600,
                speed       = base_speed;
            if($(selector).length > 0){
                var this_offset = $_this.offset(),
                    that_offset = $(selector).offset(),
                    offset_diff = Math.abs(that_offset.top - this_offset.top),
                    speed       = (offset_diff * base_speed) / 1000;
            }
            if(selector == "#"){
                $("html, body").animate({
                    scrollTop: 0
                }, speed, function(){
                    $("body").removeClass("is-scroll");
                });
            }else{
                if($(".one-page-row").length && $(".one-page-row div[data-anchor^='#']").length ){
                    $("html, body").animate({
                        scrollTop: $(".one-page-row div[data-anchor='" + selector + "']").offset().top - floatMenuH + 1
                    }, speed, function(){
                        $("body").removeClass("is-scroll");
                    });
                }else{
                    if($(selector).length > 0){
                        $("html, body").animate({
                            scrollTop:  $(selector).offset().top - floatMenuH + 1
                        }, speed, function(){
                            $("body").removeClass("is-scroll");
                        });
                    }
                }
            }
            return false;
        });

        $(window).on("debouncedresize", function() {
            $headerH = $header.height();
        });
        //var top_threshold = $("#dl-menu").offset().top + $("#dl-menu").height();

        $(window).on("scroll", function() {

            var tempCSS = {},tempScrTop = $(window).scrollTop();
            scrDir = tempScrTop - scrTop;
            if (tempScrTop > threshold && isMoved === false) {
                if( !dtGlobals.isHovering ) {
                    var s="0.5s";
                    if($header.attr("data-sp")==0) s="0.4s";
                    else if($header.attr("data-sp")==1) s="1s";
                    else if($header.attr("data-sp")==2) s="2s";
                    if($header.attr("data-st")=="1"){
                        $phantom.css("animation-duration",s).addClass("showed_tb");
                    }else{
                        $phantom.css({"transition":"opacity "+s,"opacity": 1, "visibility": "visible"});
                    }
                    if($("#phantom").hasClass("bit-logo-menu")){
                        if (dtGlobals.logoURL && dtGlobals.logoEnabled) {
                            $header.find("#branding .logo img:first").attr("src",dtGlobals.logoURL);
                        }
                    }

                    if(jQuery("#header.newrightmenu,#header.newleftmenu").length>0){
                        if( jQuery("#dl-menu:visible").length==0 && (jQuery("body").height() -threshold - tempScrTop >jQuery(window).height() ) ){
                            jQuery("#header").addClass("position-ab-fixed");
                        }
                        $phantom.find(".ph-wrap").remove();
                    }else{
                        $parent.css("min-height",$header.height()+"px");
                        $header.appendTo($menuBox);
                        $headerSlide.prependTo($phantom.find(".menu-info-box"));
                        $header.removeClass($header.data('bit-menu')).addClass($header.data('bit-float-menu')).removeClass("bit-menu-default").addClass("bit-menu-float");
                    }
                    var infoclass = $headerSlide.attr("data-class");
                    $phantom.find(".menu-info-box").addClass(infoclass);

                    isMoved = true;
                    //fancy-rollovers wf-mobile-hidden underline-hover bit-menu-float


                    if($phantom.find("#main-nav").hasClass("position-ab-center")){
                        var div1 = $phantom.find(".logo-box").width();
                        if($phantom.find(".logo-box").css("padding-left")){
                            div1 = div1*1 + $phantom.find(".logo-box").css("padding-left").replace("px","")*1
                        }
                        if($phantom.find(".logo-box").css("padding-right")){
                            div1 = div1*1 + $phantom.find(".logo-box").css("padding-right").replace("px","")*1
                        }
                        var div2 = $phantom.find(".menu-info-box").width();
                        $phantom.find(".menu-box").css("position","relative").css("left",(div2-div1)/2+"px");
                    }
                }
            }
            else if (tempScrTop <= threshold && isMoved === true) {
                //act
                jQuery("#phantom .mainmenu >.menu-item.onepage").removeClass("onepage");
                if($("#phantom").hasClass("bit-logo-menu")){
                    if(old_img_str)
                        $header.find("#branding .logo img:first").attr("src",old_img_str);
                }
                if(jQuery("#header.newrightmenu,#header.newleftmenu").length>0){
                    jQuery("#header").removeClass("position-ab-fixed");
                }else{
                    $header.appendTo($parent);
                    $parent.css("min-height","auto");
                    $header.removeClass($header.data('bit-float-menu')).addClass($header.data('bit-menu')).addClass("bit-menu-default").removeClass("bit-menu-float");
                }

                if($(".logo-classic-centered, .logo-center").length){
                    if($(".mini-search").length ){
                        $header.insertBefore(".mini-search");
                    }
                }
                if($header.attr("data-st")=="1"){
                    $phantom.removeClass("showed_tb");
                }else{
                    $phantom.css({"opacity": 0, "visibility": "hidden"});
                }


                isMoved = false;

            };
            scrTop = $(window).scrollTop();

        });
    }
    /*Floating menu:end*/
}