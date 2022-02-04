var websocket_url = 'http://' + document.domain + ':' + location.port + '/socket';
var socket = io(websocket_url);
$(document).ready(function(){
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
                    var start = '<div class="direct_box" onclick="next('
                    var mid2 = '\')"><p class="child">'
                    var end = '</p></div>'
                    $(".child_box").html("")
                    for (var i=0;i<data['paths'].length;i++){
                        var str = start + data['paths'][i]['id'] + ",\'" + data['paths'][i]['type'] + mid2
                            + data['paths'][i]['name'] + end
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
function showMenu(env){
	    	env.preventDefault();
	        //env 表示event事件
	        // 兼容event事件写法
	        var e = env || window.event;

	        // 获取菜单，让菜单显示出来
	       var context = document.getElementById("context");
	       context.style.display = "block";

	       //  让菜单随着鼠标的移动而移动
	       //  获取鼠标的坐标
	       var x = e.clientX;
	       var y = e.clientY;

	       //  调整宽度和高度
        if (x-150>=0){
            context.style.left =x-150+"px" //Math.min(w-202,x)+"px";
	        context.style.top = y+"px" //Math.min(h-230,y)+"px";
        }
        else{
            context.style.left =x+"px" //Math.min(w-202,x)+"px";
	        context.style.top = y+"px" //Math.min(h-230,y)+"px";
        }


	      // return false可以关闭系统默认菜单
	       return false;
	    };
	  // 当鼠标点击后关闭右键菜单
	  document.onclick = function(){
		  closeMenu()

	  };
function closeMenu(){
    var contextmenu = document.getElementById("context");
    contextmenu.style.display = "none";
}
function createFF(){
    $('#myModal').modal();
}
