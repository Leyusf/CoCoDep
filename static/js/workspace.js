var websocket_url = 'http://' + document.domain + ':' + location.port + '/socket';
var socket = io(websocket_url);
var curElem;
//获取可视区宽度
var winWidth = function() {
    return document.documentElement.clientWidth || document.body.clientWidth;
}
//获取可视区高度
var winHeight = function() {
    return document.documentElement.clientHeight || document.body.clientHeight;
}
$(document).ready(function(){
    document.addEventListener('click', function() {
        $("#menu").css("display","none")
    })
    var gid = $("title").attr('gid')
    var name = $("title").attr('uname')
    var uid = $("title").attr('uid')
    socket.on('connect', function() {
        socket.emit('join', {'gid': gid});
    })
    socket.on('sysMsg',function (data) {
        $("#chat_pad").append('<div class="bubble"><div class="bubble_inner"><p style="text-align: center;">' + data['data'] + '</p></div></div>')
    })
    socket.on('receive',function (data){
        if (data['uid']===uid)
            return
        $("#chat_pad").append('<div class="bubble" style="float: left"><div class="bubble_inner" style="float: left"><p style="float: left;">' + data['name'] + ": " + data['msg'] + '</p></div></div>')
    })
    $("#send_btn").click(function () {
        var msg = $(".input_area").val();
        if (msg!=""){
            socket.emit('send', {'msg': msg, 'uid': uid, 'name':name});
            $("#chat_pad").append('<div class="bubble" style="float: right"><div class="bubble_inner" style="float:right;"><p style="float: right;">' + msg + '</p></div></div>')
        }
        $(".input_area").val("")
    })
    $("#last").click(function () {
        var lastID = $(this).attr('lastid')
        if (lastID!='0'){
            goTo(lastID)
        }
    })
    $("#del").click(function () {
        var type = $(curElem).attr('eletype')
        var id = $(curElem).attr('eleid')
        if (type=="path"){
            $.ajax({
                    type:"POST",
                    url:"/deletePath/",
                    dataType:'json',
                    data:{
                        "id":id
                },
                success:function (data) {
                    if (data['code']==0){
                        var id = $(".current").attr('pid')
                        goTo(id)
                    }
                }
            })
        }
        else{
            $.ajax({
                    type:"POST",
                    url:"/deleteFile/",
                    dataType:'json',
                    data:{
                        "id":id
                },
                success:function (data) {
                    if (data['code']==0){
                        var id = $(".current").attr('pid')
                        goTo(id)
                    }
                }
            })
        }
    })
});
function next(id,type) {
    if (type=='path'){
        goTo(id)
    }
    else {

    }
}
function goTo(id){
    $.ajax({
        type:"POST",
        url:"/goTo/",
        dataType:'json',
        data:{
            "rid":id
        },
        success:function(data){
            $("#last").attr("lastid",data['lastID'])
            $(".current").attr("pid",data['root']['id'])
            $("#current").text(data['root']['name'])
            $.ajax({
                type:"POST",
                url:"/checkChildrenPaths/",
                dataType:'json',
                data:{
                    "id":id
                },
                success:function(data){
                    var start = '<div class="direct_box" oncontextmenu="showChildrenMenu(this)" onclick="next('
                    var mid1 = '\')" eleType="'
                    var mid2 = '" eleId="'
                    var mid3 = '"><p class="child">'
                    var end = '</p></div>'
                    $(".child_box").html("")
                    for (var i=0;i<data['paths'].length;i++){
                        var str = start + data['paths'][i]['id'] + ",\'" + data['paths'][i]['type'] + mid1 +
                            data['paths'][i]['type'] + mid2 + data['paths'][i]['id'] + mid3 + data['paths'][i]['name'] + end
                        $(".child_box").append(str)
                    }
                }
            })
        }
    })
}
function time() {
    var date = new Date;
    var h = date.getHours();//获取当前小时数(0-23)
    var m = date.getMinutes();//获取当前分钟数(0-59)
    var s = date.getSeconds();//获取当前秒
    return h + " : " + m + " : " + s
}
function showChildrenMenu(obj){
    var x = $(obj).offset().top;
    var y = $(obj).offset().left;
    var id = $(obj).attr("eleId")
    var type = $(obj).attr("eleType")
    if( x >= (winWidth() - menu.offsetWidth) ) {
        x  = winWidth() - menu.offsetWidth;
    } else {
        x = x
    }
    if(y > winHeight() - menu.offsetHeight  ) {
        y = winHeight() - menu.offsetHeight;
    } else {
        y = y;
    }
    curElem = obj
    var element = $("#menu")
    $("#childType").text(type.charAt(0).toUpperCase() + type.slice(1))
    element.css("display","block")
    element.css({'top': x + 'px','left':y + 'px'});
    element.css("z-index","99")
    return false;
}
function createFF(){
    $('#myModal').modal();
}
