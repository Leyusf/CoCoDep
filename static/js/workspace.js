var websocket_url = 'http://' + document.domain + ':' + location.port + '/socket';
var socket = io(websocket_url);
var curElem;
var curFileId;
var content;
$(document).ready(function(){
    document.addEventListener('click', function() {
        $("#menu").css("display","none")
    })
    document.addEventListener('click', function() {
        $("#operation").css("display","none")
    })
    var gid = $("title").attr('gid')
    var name = $("title").attr('uname')
    var uid = $("title").attr('uid')
    socket.on('readText', function(data) {
        if (data['content']!=content)
            $("#edit").val(data['content'])
    })
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
    $("#newPath").click(function () {
        var res = newPath()
        if (res===false){
            alert("Cannot create this folder.")
        }
        else{
            var rid = $(curElem).attr('pid')
            $.ajax({
                type:"POST",
                url:"/newPath/",
                    dataType:'json',
                    data:{
                        "rid":rid,
                        "gid":gid,
                        "name":res
                },
                success:function (data) {
                    if (data['code']==0){
                        goTo(rid)
                    }
                    else{
                        alert("Cannot create this folder.")
                    }
                }
            })
        }
    })
    $("#addFile").click(function () {
        $("#save").click()
        var rid = $(curElem).attr('pid')
        $("#rid").val(rid)
        $("#save").on('change',function (){
            if ($(this).val() != ""){
                $("#fileAdd").submit()
            }
        })
    })
    $("#newFile").click(function () {
        var res = newFile()
        if (res===false){
            alert("Cannot create this file.")
        }
        else{
            var rid = $(curElem).attr('pid')
            $.ajax({
                type:"POST",
                url:"/newFile/",
                    dataType:'json',
                    data:{
                        "rid":rid,
                        "name":res
                },
                success:function (data) {
                    if (data['code']==0){
                        goTo(rid)
                    }
                    else{
                        alert("Cannot create this file.")
                    }
                }
            })
        }
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
            if (deletePath()===false){
                $("#menu").css("display","none")
                return false
            }
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
            if (deleteFile()===false){
                $("#menu").css("display","none")
                return false
            }
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
    $('#edit').on('input propertychange',function(){
        content = $("#edit").val()
        console.log(content)
        socket.emit('writeAction', {'id': curFileId,'content':content});
    })
    // $("#edit").input(function () {
    //     // 给socket发送同步信息
    //     console.log($("#edit").val())
    //     socket.emit('writeAction', {'id': curFileId,'content':$("#edit").val()});
    // })
});
function next(id,type) {
    if (type=='path'){
        goTo(id)
        $("#edit").val("")
        $("#edit").attr('disabled',"disabled")
    }
    else {
        // 如果是文件，获取文件内容并展示
        curFileId = id
        $("#edit").removeAttr('disabled')
        socket.emit('readAction', {'id': id});
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
    var evt = window.event || arguments[0];
    /*获取当前鼠标右键按下后的位置，据此定义菜单显示的位置*/
    var x = evt.clientX;
    var y = evt.clientY;
    var type = $(obj).attr("eleType")
    curElem = obj
    var element = $("#menu")
    $("#childType").text(type.charAt(0).toUpperCase() + type.slice(1))
    element.css("display","block")
    element.css({'top': y + 'px','left':x + 'px'});
    element.css("z-index","99")
    return false;
}
function showOperationMenu(obj){
    var evt = window.event || arguments[0];
    /*获取当前鼠标右键按下后的位置，据此定义菜单显示的位置*/
    var x = evt.clientX;
    var y = evt.clientY;
    curElem = obj
    var element = $("#operation")
    element.css("display","block")
    element.css({'top': y + 'px','left':x + 'px'});
    element.css("z-index","99")
    return false;
}
function deletePath(){    /* 绑定事件 */
    var r = confirm("Do you want to delete this folder and all its contents?")
    if (r == true) {
        return true
    }
    return false
}
function deleteFile(){    /* 绑定事件 */
    var r = confirm("Do you want to delete this file?")
    if (r == true) {
        return true
    }
    return false
}
function newPath(){
    var t=prompt("Path name:")
    if (t!=null && t!="") {
        return t
    }
    return false
}
function newFile(){
    var t=prompt("File name:")
    if (t!=null && t!="") {
        return t
    }
    return false
}
function tab(){
  if (event.keyCode == 9)
  {
     $("#edit").insertAtCaret("\t");
     event.returnValue = false;
  }
}
// 可以在光标处插入文本
(function ($) {
    "use strict";
    $.fn.extend({
        insertAtCaret : function (myValue) {
            var $t = $(this)[0];
            if (document.selection) {
                this.focus();
                var sel = document.selection.createRange();
                sel.text = myValue;
                this.focus();
            } else
                if ($t.selectionStart || $t.selectionStart == '0') {
                    var startPos = $t.selectionStart;
                    var endPos = $t.selectionEnd;
                    var scrollTop = $t.scrollTop;
                    $t.value = $t.value.substring(0, startPos) + myValue + $t.value.substring(endPos, $t.value.length);
                    this.focus();
                    $t.selectionStart = startPos + myValue.length;
                    $t.selectionEnd = startPos + myValue.length;
                    $t.scrollTop = scrollTop;
                } else {
                    this.value += myValue;
                    this.focus();
                }
        }
    });
})(jQuery);
