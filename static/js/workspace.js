var room,name;
var websocket_url = 'http://' + document.domain + ':' + location.port + '/socketio/';
var socket = io(websocket_url);
$(document).ready(function(){
    room = $("#info").attr('room')
    name = $("#info").attr('name')
    socket.on('connect', function() {
        socket.emit('join', {room: room, name: name});
    });
    socket.on('chat-resp',function (data) {
        if (data.name!='System')
            $("#msg_box").append(data.name + ": " + data.msg + "\n")
        else{
            $("#msg_box").append(data.msg + "\n")
        }
    });
    function send() {
        var message = $("#speak").val()
        socket.emit('speak', {msg: message, name: name});
        $("#speak").val("")
    }
    socket.on('file-resp',function (data) {
        console.log(data)
    });
    $("#new_btn").click(function (){
        var type = $('input:radio:checked').val()
        var name = $("#create_name").val()
        var last = $("#root").text()
        console.log(type)
        console.log(name)
        console.log(last)
        $.ajax({
            url:'/newpath/',
            type:'post',
            dataType: 'json',
            data: {
                'root': last,
                'path': name,
                'gid': room,
                'type': type
            },
            success:function (data) {
                console.log(data)
            }
        })
    })
        $(".fileItem").click(function () {
        if ($(this).attr('type')==='folder'){
            $("#last").css('display','block')
            $("#last").text($(this).text())
            $("#root").text($(this).text())
            $("#child").html("")
            $.ajax({
                    type:"POST",
                    url:"/rightpath/",
                      dataType:'json',
                      data:{
                        "path":$(this).text(),
                        "gid":room,
                      },
                    success:function (data){
                        console.log(data)
                    }
            })
        }
    })
});
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
