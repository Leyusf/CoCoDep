var websocket_url = 'http://' + document.domain + ':' + location.port + '/socket';
var socket = io(websocket_url);
var curElem;
var curFileId;
var content;
// 0表示没有他人输入，1表示需要先处理他人输入
var readFlag = 0;
var content = ""
var uid;
$(document).ready(function(){
    var isIE = !(!document.all);
    function posCursor(){
      var start=0,end=0;
      var oTextarea = document.getElementById("edit");
      if(isIE){
        //selection 当前激活选中区，即高亮文本块，和/或文当中用户可执行某些操作的其它元素。
        //createRange 从当前文本选中区中创建 TextRange 对象，
        //或从控件选中区中创建 controlRange 集合。
        var sTextRange= document.selection.createRange();

        //判断选中的是不是textarea对象
        if(sTextRange.parentElement()== oTextarea){
          //创建一个TextRange对象
          var oTextRange = document.body.createTextRange();
          //移动文本范围以便范围的开始和结束位置能够完全包含给定元素的文本。
          oTextRange.moveToElementText(oTextarea);

          //此时得到两个 TextRange
          //oTextRange文本域(textarea)中文本的TextRange对象
          //sTextRange是选中区域文本的TextRange对象

          //compareEndPoints方法介绍，compareEndPoints方法用于比较两个TextRange对象的位置
          //StartToEnd  比较TextRange开头与参数TextRange的末尾。
          //StartToStart比较TextRange开头与参数TextRange的开头。
          //EndToStart  比较TextRange末尾与参数TextRange的开头。
          //EndToEnd    比较TextRange末尾与参数TextRange的末尾。

          //moveStart方法介绍，更改范围的开始位置
          //character 按字符移动
          //word       按单词移动
          //sentence  按句子移动
          //textedit  启动编辑动作

          //这里我们比较oTextRange和sTextRange的开头，的到选中区域的开头位置
          for (start=0; oTextRange.compareEndPoints("StartToStart", sTextRange) < 0; start++){
            oTextRange.moveStart('character', 1);
          }
          //需要计算一下\n的数目(按字符移动的方式不计\n,所以这里加上)
          for (var i = 0; i <= start; i ++){
            if (oTextarea.value.charAt(i) == '\n'){
              start++;
            }
          }

          //再计算一次结束的位置
          oTextRange.moveToElementText(oTextarea);
          for (end = 0; oTextRange.compareEndPoints('StartToEnd', sTextRange) < 0; end ++){
            oTextRange.moveStart('character', 1);
          }
          for (var i = 0; i <= end; i ++){
            if (oTextarea.value.charAt(i) == '\n'){
              end++;
            }
          }
        }
      }else{
        start = oTextarea.selectionStart;
        end = oTextarea.selectionEnd;
      }
      return [start,end]
    }

    function moveCursor(start,end){
      var oTextarea = document.getElementById("edit");
      if(isNaN(start)||isNaN(end)){
        alert("Error");
      }
      if(isIE){
        var oTextRange = oTextarea.createTextRange();
        var LStart = start;
        var LEnd = end;
        var start = 0;
        var end = 0;
        var value = oTextarea.value;
        for(var i=0; i<value.length && i<LStart; i++){
          var c = value.charAt(i);
          if(c!='\n'){
            start++;
          }
        }
        for(var i=value.length-1; i>=LEnd && i>=0; i--){
          var c = value.charAt(i);
          if(c!='\n'){
            end++;
          }
        }
        oTextRange.moveStart('character', start);
        oTextRange.moveEnd('character', -end);
        //oTextRange.collapse(true);
        oTextRange.select();
        oTextarea.focus();
      }else{
        oTextarea.select();
        oTextarea.selectionStart=start;
        oTextarea.selectionEnd=end;
      }
    }

    document.addEventListener('click', function() {
        $("#menu").css("display","none")
    })
    document.addEventListener('click', function() {
        $("#operation").css("display","none")
    })
    $("textarea").attr('spellcheck','false')
    var recorder = null;
    var gid = $("title").attr('gid')
    var name = $("title").attr('uname')
    uid = $("title").attr('uid')
        $("#voice").click(function () {
            if($(this).attr("flag")==0){
                startRecording()
                $(this).text("End")
                $(this).attr("flag",1)
            }
            else{
                recorder.stop();
                socket.emit('send_voice', {'uid': uid, 'gid' : gid, 'file' : recorder.getBlob()});
                $(this).attr("flag",0)
                $(this).text("Record")
            }
        })
        function startRecording() {
            if(recorder != null) {
                recorder.close();
            }
            Recorder.get(function (rec) {
                recorder = rec;
                recorder.start();
            });
        }
    socket.on('folder', function (data){
        if ($(".current").attr('pid')==data['id'])
            goTo(data['id'])
    })
    socket.on('voice', function (data){
        var arr = new Array(data['voice'])
        var voice = new Blob(arr,{type: "audio/wav"})
        $("#chat_pad").append('<div class="bubble" style="float: left;width: 100%"><div class="bubble_inner" style="float: left;width: 100%">' +
            '<p style="float: left;">' + data['name'] + ": </p>" + '<audio controls src="' + window.URL.createObjectURL(voice) + '">' +
            '</audio>' + '</div></div>')
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
                        socket.emit('folderChange', {'id': rid});
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
                        socket.emit('folderChange', {'id': rid});
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
                        socket.emit('folderChange', {'id': id});
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
                        socket.emit('folderChange', {'id': id});
                    }
                }
            })
        }
    })
    $("#edit").scroll(function(){
        $("#num").scrollTop($(this).scrollTop()); // 纵向滚动条
    });
    $("#num").scroll(function(){
        $("#edit").scrollTop($(this).scrollTop());
    });
    socket.on('readText', function(data) {
        // 不是一个文件
        if (curFileId!=data['id']){
            return
        }
        // 是一个文件
        if (uid==data['uid']){
            $("#edit").val(data['content'])
            content = data['content']
            var num = Number(content.split("\n").length)
            var curNum = Number($("#num").attr('total'))
            lineCount(num,curNum)
        }

    })
    // socket.on('readChange', function(data) {
    //     // 不是一个文件
    //     if (curFileId!=data['fid']){
    //         return
    //     }
    //     var pos = posCursor()
    //     console.log(pos)
    //     var totalNumber = $("#edit").val().length
    //     var noChange = true
    //     if (data['uid']!=uid){
    //         readFlag = 1
    //         var pad = document.getElementById('edit')
    //         if (data['operation']==0){
    //             pad.setRangeText(data['content'],data['start'],data['end'],'end')
    //         }
    //         else if (data['operation']==1){
    //             pad.setRangeText(data['content'],data['start'],data['start'],'end')
    //             if (data['end']<=pos[1]){
    //                 noChange = false
    //             }
    //         }
    //         else{
    //             if (data['start']>data['end']){
    //                 var tmp = data['start']
    //                 data['start'] = data['end']
    //                 data['end'] = tmp
    //             }
    //
    //             console.log("S E: " + data['start']+" : "+data['end'])
    //             pad.setRangeText("",data['start'],data['end'],'end')
    //             pad.setRangeText(data['content'],data['start'],data['start'],'end')
    //             if (data['end']<=pos[1]){
    //                 noChange = false
    //             }
    //         }
    //         content = $("#edit").val()
    //         var changeNumber = content.length - totalNumber
    //         console.log(changeNumber)
    //         if (noChange==false){
    //             pos[0] = pos[0] + changeNumber
    //             pos[1] = pos[1] + changeNumber
    //         }
    //         moveCursor(pos[0],pos[1])
    //         pos = posCursor()
    //         console.log(pos)
    //         var num = Number(content.split("\n").length)
    //         var curNum = Number($("#num").attr('total'))
    //         lineCount(num,curNum)
    //     }
    // })
        socket.on('readChange', function(data) {
        // 不是一个文件
        if (curFileId!=data['fid']){
            return
        }
        var pos = posCursor()
            console.log(pos + " S: " + data['start'])
        var delta = data['content'].length - content.length
            console.log(delta)
        $("#edit").val(data['content'])
        content = $("#edit").val()
        if (pos[0]>data['start']){
            pos[0] += delta
            pos[1] += delta
        }
        console.log("M: "+ pos)
        if (content.length<pos[1]){
            pos[1]=content.length
        }
        moveCursor(pos[0],pos[1])
        pos = posCursor()
        console.log("R: "+ pos)
            var num = Number(content.split("\n").length)
            var curNum = Number($("#num").attr('total'))
            lineCount(num,curNum)
    })
    // 判断文件的变化
    // $('#edit').on('input propertychange',function(){
    //     let i;
    //     // 对于他人输入不做处理
    //     if (readFlag==1){
    //         readFlag = 0
    //         return
    //     }
    //     // 自己的输入进行处理
    //     var num = Number($(this).val().split("\n").length)
    //     var curNum = Number($("#num").attr('total'))
    //     lineCount(num,curNum)
    //     var startP = -1, endP = -1, diff=""
    //     var cur_content = $(this).val()
    //     var oldLength = content.length
    //     var newLength = cur_content.length
    //     var deltaLength = newLength - oldLength
    //     var operation;
    //     var it;
    //     if (deltaLength>0){
    //         operation = 1
    //         for (i = 0; i<oldLength; i++){
    //             if (cur_content[i]!=content[i]){
    //                 startP = i
    //                 break
    //             }
    //         }
    //         if (startP==-1){
    //             startP = oldLength
    //             endP = newLength
    //         }
    //         endP = startP + deltaLength
    //         diff = cur_content.substring(startP,endP)
    //     }
    //     else if (deltaLength==0){
    //         operation = 0
    //         for (i = 0; i<oldLength; i++){
    //             if (cur_content[i]!=content[i]){
    //                 startP = i
    //                 break
    //             }
    //         }
    //         for (i = oldLength-1; i>=0; i--){
    //             if (cur_content[i]!=content[i]){
    //                 endP = i + 1
    //                 break
    //             }
    //         }
    //         diff = cur_content.substring(startP,endP)
    //     }
    //     else{
    //         operation = -1
    //         for (i = 0; i<newLength; i++){
    //             if (cur_content[i]!=content[i]){
    //                 startP = i
    //                 break
    //             }
    //         }
    //         for (i = 1; i<=newLength; i++){
    //             if (cur_content[newLength-i]!=content[oldLength-i]){
    //                 endP = oldLength-i+1
    //                 it = i
    //                 break
    //             }
    //         }
    //         if (startP==-1){
    //             startP = newLength
    //             endP = oldLength
    //         }
    //         else if (endP==-1){
    //             startP = 0
    //             endP = deltaLength * -1
    //         }
    //         else{
    //             if (endP<=startP){
    //                 diff = ""
    //                 endP = startP - deltaLength
    //             }
    //             else{
    //                 console.log("S: "+startP+" E:"+endP)
    //                 diff = cur_content.substring(startP,newLength-it+1)
    //                 if (startP==endP){
    //                     diff = ""
    //                     endP+=1
    //                 }
    //                 console.log("Diff: "+diff)
    //             }
    //         }
    //     }
    //     socket.emit('writeAction', {'fid': curFileId, 'uid':uid, 'content':diff, 'start':startP, 'end':endP, 'operation':operation});
    //     content = $(this).val()
    // })
    $('#edit').on('input propertychange',function(){
        let i;
        // 对于他人输入不做处理
        if (readFlag==1){
            readFlag = 0
            return
        }
        // 自己的输入进行处理
        var num = Number($(this).val().split("\n").length)
        var curNum = Number($("#num").attr('total'))
        lineCount(num,curNum)
        var startP = -1
        var cur_content = $(this).val()
        var oldLength = content.length
        var newLength = cur_content.length
        for(i=0;i<newLength;i++){
            if (i==oldLength||cur_content[i]!=content[i]){
                startP = i
                break
            }
        }
        socket.emit('writeAction', {'fid': curFileId, 'uid':uid, 'content':cur_content, 'start':startP, 'count': newLength - oldLength});
        content = $(this).val()
    })
});
function next(id,type) {
    if (type=='path'){
        goTo(id)
        $("#edit").val("")
        $("#edit").attr('disabled',"disabled")
        content = ""
        curFileId = 0
    }
    else {
        // 如果是文件，获取文件内容并展示
        curFileId = id
        $("#edit").removeAttr('disabled')
        socket.emit('readAction', {'id': id, 'uid': uid});
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
function lineCount(num,curNum){
    let i;
    if (num>curNum){
            for (i = curNum+1; i<=num; i++) {
                var str = '<p line="' + i + '" class="lineNum">' + i +'</p>'
                $("#num").append(str)
            }
        }
        else if (num<curNum){
            $("#num").html("")
            for (i = 1; i<=num; i++) {
                var str = '<p line="' + i + '" class="lineNum">' + i +'</p>'
                $("#num").append(str)
            }
        }
        $("#num").attr('total',num)
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
(function($, h, c) {
    var a = $([]),
        e = $.resize = $.extend($.resize, {}),
        i,
        k = "setTimeout",
        j = "resize",
        d = j + "-special-event",
        b = "delay",
        f = "throttleWindow";
    e[b] = 250;
    e[f] = true;
    $.event.special[j] = {
        setup: function() {
            if (!e[f] && this[k]) {
                return false;
            }
            var l = $(this);
            a = a.add(l);
            $.data(this, d, {
                w: l.width(),
                h: l.height()
            });
            if (a.length === 1) {
                g();
            }
        },
        teardown: function() {
            if (!e[f] && this[k]) {
                return false;
            }
            var l = $(this);
            a = a.not(l);
            l.removeData(d);
            if (!a.length) {
                clearTimeout(i);
            }
        },
        add: function(l) {
            if (!e[f] && this[k]) {
                return false;
            }
            var n;
            function m(s, o, p) {
                var q = $(this),
                    r = $.data(this, d);
                r.w = o !== c ? o: q.width();
                r.h = p !== c ? p: q.height();
                n.apply(this, arguments);
            }
            if ($.isFunction(l)) {
                n = l;
                return m;
            } else {
                n = l.handler;
                l.handler = m;
            }
        }
    };
    function g() {
        i = h[k](function() {
                a.each(function() {
                    var n = $(this),
                        m = n.width(),
                        l = n.height(),
                        o = $.data(this, d);
                    if (m !== o.w || l !== o.h) {
                        n.trigger(j, [o.w = m, o.h = l]);
                    }
                });
                g();
            },
            e[b]);
    }
})(jQuery, this);
$(function () {
                $("#fileAdd").ajaxForm(function (data) {
                        if (data['code']==0){
                            socket.emit('folderChange', {'id': $(".current").attr('pid')});
                            // goTo($(".current").attr('pid'))
                        }
                        else{
                            alert("Cannot create this file.")
                        }
                    }
                );
            })
// function savePos(){
//     var textBox = document.getElementById("edit")
//     if(typeof(textBox.selectionStart) == "number"){
//         start = textBox.selectionStart;
//         end = textBox.selectionEnd;
//     }
//     return [start,end]
// }

