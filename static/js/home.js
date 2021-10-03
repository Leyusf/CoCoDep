var email = ""
var username = ""
var headpic = ""
var sign = ""
var click = 0
var curElem = null
//获取可视区宽度
var winWidth = function() {
    return document.documentElement.clientWidth || document.body.clientWidth;
}
//获取可视区高度
var winHeight = function() {
    return document.documentElement.clientHeight || document.body.clientHeight;
}
$(function () {
    document.addEventListener('click', function() {
        $("#menu").css("display","none")
    })
    $("#menu").on('click', function(event) {
        var event = event || window.event;
        event.cancelBubble = true;
    })
    $.ajax({
        type:"GET",
        url:"/userinfo",
        dataType:'json',
        success:function(data) {
            if(data['code']===0){
                $("#username").html(data['username'])
                username = data['username']
                $("#email").html(data['email'])
                email = data['email']
                if (data['sign']!==""){
                    $("#sign").val(data['sign'])
                    sign = data['sign']
                }
                $("#headpic").attr('src',data['headpic'])
                var headpic = data['headpic']
            }
            else{
                // 未登录状态
                location.href = '/'
            }
        }
    })
    $.ajax({
        type:"POST",
        url:"/rootpath",
        dataType:'json',
        success:function(data) {
            if(data['code']===0){
                if (data['paths'].length===0 && data['files'].length===0){
                    $("#noFile").css("display","block")
                    $("#hasFile").css("display","none")
                }
                else {
                    $("#hasFile1").css("display","block")
                    var root = '<p><a oncontextmenu="fmenu(this)" class="path" id="curpath" href="javascript:void(0);" style="font-size: 15px" onclick="leftPathClick(&apos;'+ data['paths'][0] +'&apos;)">'+ data['paths'][0] +'</a></p>'
                    $("#hasFile1").html(root)
                    var context = ""
                    for (var i=1;i<data['paths'].length;i++){
                        context += '<p><a oncontextmenu="fmenu(this)" class="path" name="path" href="javascript:void(0);" style="font-size: 15px" onclick="rightPathClick(this)">'+ data['paths'][i] +'</a></p>'
                    }
                    for (var i=0;i<data['files'].length;i++){
                        context += '<p><a oncontextmenu="fmenu(this)" class="file" name="file" href="javascript:void(0);" style="font-size: 15px" onclick="rightPathClick(this)">'+ data['files'][i] +'</a></p>'
                    }

                    $("#hasFile2").html(context)
                    $("#hasFile2").css("display","block")
                    $("#noFile").css("display","none")
                }
            }
            else{
                // 未登录状态
                location.href = '/'
            }
        }
    })
    $("#sign").on('blur', function () {
        if ($('#sign').val() !== '') {
            $.ajax({
                type:"POST",
                url:"/setSign",
                data:{
                    "sign":$('#sign').val()
                },
                dataType:'json'
            })
        }
    })
    $("#share_btn").click(function () {
        var pwd = $("#filepwd").val()
        var name = $(curElem).html()
        $.ajax({
            type: "POST",
            url:'/filelock/'+ email + "/" + name + "/" + pwd,
            dataType:'json',
            data:{"path":$("#curpath").html()},
            success:function(data){
                if (data['code']===0){
                    if (pwd==="0000"){
                        showConfirm("设为私密文件",null,null,title='不公开')
                        return
                    }
                    showConfirm("将: "+getRootPath()+data['url']+"\n给你的好友吧",null,null,title='分享成功')
                }
            }
        })
    })
    $("#file").change(function () {
        var files = document.getElementById("file").files;
        if(files.length === 0) return;
        $("#box").html(files[0].name)
    })
    $("#upload").click(function (){
        var f = document.getElementById("file");
        f.click();//因为被隐藏了，所以用一个函数调用模仿手动点击事件
    })
    $("#load").click(function (){
        var files = document.getElementById('file').files; //files是文件选择框选择的文件对象数组

        if(files.length === 0) return;
        var vv=(files[0].size/1024).toFixed(2);
        $.ajax({
            type: "POST",
            url:'/reset/'+ email + "/" + vv,
            dataType:'json',
            success:function(data){
                console.log(data)
                if (data['enough']===1){
                    var path = $("#curpath").html()
                    // 1.先生成一个formdata对象
                    var myFormData = new FormData();
                    $("#res").css("display","none")
                    // 2.朝对象中添加文件数据
                    // 3.先通过jquery查找到该标签
                    // 4.将jquery对象转换成原生的js对象
                    // 5.利用原生js对象的方法 直接获取文件内容
                    myFormData.append('file',files[0]);
                    $.ajax({
                        type: "POST",
                        url:'/upload/1'+path+"1",
                        dataType:'json',
                        data: myFormData, // 直接丢对象
                        // ajax传文件 一定要指定两个关键性的参数
                        contentType:false,  // 不用任何编码 因为formdata对象自带编码 django能够识别该对象
                        processData:false,  // 告诉浏览器不要处理我的数据 直接发就行
                        xhr: function() {
                            var xhr = new XMLHttpRequest();
                            $('.progress').css('opacity', 1.0);
                            //使用XMLHttpRequest.upload监听上传过程，注册progress事件，打印回调函数中的event事件
                            xhr.upload.addEventListener('progress', function (e) {
                                //loaded代表上传了多少
                                //total代表总数为多少
                                var progressRate = (e.loaded / e.total) * 100 + '%';

                                //通过设置进度条的宽度达到效果
                                $('.progress > div').css('width', progressRate);

                            })
                            return xhr;
                        },
                        success:function(data) {
                            if(data['code']===0){
                                $("#res").html("上传完成")
                                $("#res").css("color","green")
                                $("#res").css("display","block")
                                var context = ""
                                for (var i=0;i<data['paths'].length;i++){
                                    context += '<p><a oncontextmenu="fmenu(this)" class="path" name="path" href="javascript:void(0);" style="font-size: 15px" onclick="rightPathClick(this)">'+ data['paths'][i] +'</a></p>'
                                }
                                for (var i=0;i<data['files'].length;i++){
                                    context += '<p><a oncontextmenu="fmenu(this)" class="file" name="file" href="javascript:void(0);" style="font-size: 15px" onclick="rightPathClick(this)">'+ data['files'][i] +'</a></p>'
                                }
                                $("#hasFile2").html(context)
                                $("#hasFile2").css("display","block")
                                $("#noFile").css("display","none")
                            }
                            else {
                                if (data['code']===-1){
                                    $("#res").html(data['msg'])
                                }
                                $("#res").css("color","red")
                                $("#res").css("display","block")
                            }
                        }
                    });
                }
                else {
                    $("#res").html("空间不足")
                    $("#res").css("color","red")
                    $("#res").css("display","block")
                    return;
                }
            }
        })
    })
})
function rightPathClick(obj) {
    var path = $(obj).html()
    var email = $("#email").html()
    var type = $(obj).attr('name')
    if (type==='file'){
        var filename = path
        $.ajax({
            type:"POST",
            url:"/download/"+email+"/"+filename,
            data:{
                "path":$("#curpath").html()
            },
            datatype:"json",
            success:function (data) {
                if (data['code']===0){
                    window.location = '/downFile/'+ email +'/' + data['id']
                }
                else {
                    alert(data)
                }
            }
        })
    }
    else {
        $.ajax({
            type:"POST",
            url:"/rightpath",
            data:{
                "path":path
            },
            datatype:"json",
            success:function (data){
                // 是目录
                var root = '<p><a oncontextmenu="fmenu(this)" class="path" id="curpath" href="javascript:void(0);" style="font-size: 15px" onclick="leftPathClick(&apos;'+ data['paths'][0] +'&apos;)">'+ data['paths'][0] +'</a></p>'
                $("#hasFile1").html(root)
                var context = ""
                for (var i=1;i<data['paths'].length;i++){
                    context += '<p><a oncontextmenu="fmenu(this)" class="path" name="path" href="javascript:void(0);" style="font-size: 15px" onclick="rightPathClick(this)">'+ data['paths'][i] +'</a></p>'
                }
                for (var i=0;i<data['files'].length;i++){
                    context += '<p><a oncontextmenu="fmenu(this)" class="file" name="file" href="javascript:void(0);" style="font-size: 15px" onclick="rightPathClick(this)">'+ data['files'][i] +'</a></p>'
                }
                $("#hasFile2").html(context)

            }
        })
    }
}
function leftPathClick(path){
    $.ajax({
        type:"POST",
        url:"/leftpath",
        data:{
            "path":path
        },
        datatype:"json",
        success:function (data){
            var root = '<p><a oncontextmenu="fmenu(this)" id="curpath" class="path" href="javascript:void(0);" style="font-size: 15px" onclick="leftPathClick(&apos;'+ data['paths'][0] +'&apos;)">'+ data['paths'][0] +'</a></p>'
            $("#hasFile1").html(root)
            var context = ""
            for (var i=1;i<data['paths'].length;i++){
                context += '<p><a oncontextmenu="fmenu(this)" class="path" name="path" href="javascript:void(0);" style="font-size: 15px" onclick="rightPathClick(this)">'+ data['paths'][i] +'</a></p>'
            }
            for (var i=0;i<data['files'].length;i++){
                context += '<p><a oncontextmenu="fmenu(this)" class="file" name="file" href="javascript:void(0);" style="font-size: 15px" onclick="rightPathClick(this)">'+ data['files'][i] +'</a></p>'
            }
            $("#hasFile2").html(context)
        }
    })
}
function showKeyPress(evt) {
    evt = (evt) ? evt : window.event
    var specialKey = "[`.%~!#$^&*()=|{}':;',\\[\\].<>/?~！#￥……&*（）——|{}【】‘；：”“'。，、？]‘’";//Specific Key list
    var realkey = String.fromCharCode(evt.keyCode);
    var flg = false;
    flg = (specialKey.indexOf(realkey) >= 0);
    if (flg) {
        alert('请勿输入特殊字符: ' + realkey);
        evt.returnValue= false;
        return false;
    }
    return true;
}
function addPath(){
    $("#add").html("<input id='path' size=\"25\" onkeypress='showKeyPress()' style='margin-top: 5px;margin-right:5px;outline: #d1e7dd'>" +
        "<button class='submitBtn' onclick='addPathToBack()'>创建</button><script>" + "$('#path').focus();" +
        "</script>")
}
function addPathToBack() {
    click = 1
    var root = $("#curpath").html()
    var path = $("#path").val()
    $.ajax({
        type:"POST",
        url:"/newpath",
        data:{
            "root":root,
            "path":path
        },
        datatype:"json",
        success:function(data) {
            if(data['code']===0){
                var context = ""
                for (var i=1;i<data['paths'].length;i++){
                    context += '<p><a oncontextmenu="fmenu(this)" class="path" name="path" href="javascript:void(0);" style="font-size: 15px" onclick="rightPathClick(this)">'+ data['paths'][i] +'</a></p>'
                }
                for (var i=0;i<data['files'].length;i++){
                    context += '<p><a oncontextmenu="fmenu(this)" class="file" name="file" href="javascript:void(0);" style="font-size: 15px" onclick="rightPathClick(this)">'+ data['files'][i] +'</a></p>'
                }
                $("#hasFile2").html(context)
                $("#hasFile2").css("display","block")
                $("#noFile").css("display","none")
                $('#add').html("<a style='font-size: 15px;' onclick='addPath()'>添加目录</a>")
            }
            else {
                alert(data['msg'])
            }
        }
    })
    click = 0
}

function fmenu(obj){
    var type = $(obj).attr("class")
    var x = $(obj).offset().top;
    var y = $(obj).offset().left;
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

    if (type==="path"){
        $("#type").html("目录")
        $("#size").css("display","none")
        $("#date").css("display","none")
    }
    else {
        $("#type").html("文件")
        var data = fileinfo(obj)
        $("#size").css("display","block")
        $("#date").css("display","block")
        $("#share").attr("onclick","share()")
        $("#share").css("display","block")
    }
    $("#del").attr("onclick","dele(curElem)")


    $("#menu").css("display","block")
    $("#menu").css({'top': x + 'px','left':y + 'px'});
    $("#menu").css("z-index","99")
    return false;
}
function share(){
    $('#myModal').modal();
}
dF = function deleFile(name){
    var email = $("#email").html()
    $.ajax({
        type:"POST",
        url:"/delFile/"+email+"/"+name,
        data:{
            "path":$("#curpath").html()
        },
        datatype:"json",
        success:function(data) {
            if(data['code']===0){
                var context = ""
                for (var i=1;i<data['paths'].length;i++){
                    context += '<p><a oncontextmenu="fmenu(this)" class="path" name="path" href="javascript:void(0);" style="font-size: 15px" onclick="rightPathClick(this)">'+ data['paths'][i] +'</a></p>'
                }
                for (var i=0;i<data['files'].length;i++){
                    context += '<p><a oncontextmenu="fmenu(this)" class="file" name="file" href="javascript:void(0);" style="font-size: 15px" onclick="rightPathClick(this)">'+ data['files'][i] +'</a></p>'
                }
                $("#hasFile2").html(context)
                $("#hasFile2").css("display","block")
                $("#noFile").css("display","none")
                $('#add').html("<a style='font-size: 15px;' onclick='addPath()'>添加目录</a>")
            }
        }
    })
}
dA = function deleAll(name){
    var email = $("#email").html()
    $.ajax({
        type:"POST",
        url:"/delAll/"+email,
        data:{
            "path":name
        },
        datatype:"json",
        success:function(data) {
            if(data['code']===0){
                var root = '<p><a oncontextmenu="fmenu(this)" id="curpath" class="path" href="javascript:void(0);" style="font-size: 15px" onclick="leftPathClick(&apos;'+ data['paths'][0] +'&apos;)">'+ data['paths'][0] +'</a></p>'
                $("#hasFile1").html(root)
                var context = ""
                for (var i=1;i<data['paths'].length;i++){
                    context += '<p><a oncontextmenu="fmenu(this)" class="path" name="path" href="javascript:void(0);" style="font-size: 15px" onclick="rightPathClick(this)">'+ data['paths'][i] +'</a></p>'
                }
                for (var i=0;i<data['files'].length;i++){
                    context += '<p><a oncontextmenu="fmenu(this)" class="file" name="file" href="javascript:void(0);" style="font-size: 15px" onclick="rightPathClick(this)">'+ data['files'][i] +'</a></p>'
                }
                $("#hasFile2").html(context)
                $("#hasFile2").css("display","block")
                $("#noFile").css("display","none")
                $('#add').html("<a style='font-size: 15px;' onclick='addPath()'>添加目录</a>")
            }
        }
    })
}
function dele(obj) {
    var type = $(obj).attr("id")
    var name = $(obj).html()
    if (type==="curpath"){
        showConfirm("确定要删除目录下所有内容吗？",dA,name)
    }
    else{
        type = $(obj).attr("name")
        if (type==="path"){
            showConfirm("确定要删除该目录吗？",dA,name)
        }
        else{
            showConfirm("确定要删除该文件吗？",dF,name)
        }
    }
}
function showConfirm(msg,callback,name,title='提示'){
    //var res = false;
    Modal.confirm(
        {
            title:title,
            msg: msg,
        }).on( function (e) {
        callback(name);
        //res=true;
    });
    //return res;
}
/***
 * 模态框封装
 */
$(function () {
    window.Modal = function () {
        var reg = new RegExp("\\[([^\\[\\]]*?)\\]", 'igm');
        var alr = $("#com-alert");
        var ahtml = alr.html();

        var _tip = function (options, sec) {
            alr.html(ahtml);    // 复原
            alr.find('.ok').hide();
            alr.find('.cancel').hide();
            alr.find('.modal-content').width(500);
            _dialog(options, sec);

            return {
                on: function (callback) {
                }
            };
        };

        var _alert = function (options) {
            alr.html(ahtml);  // 复原
            alr.find('.ok').removeClass('btn-success').addClass('btn-primary');
            alr.find('.cancel').hide();
            _dialog(options);

            return {
                on: function (callback) {
                    if (callback && callback instanceof Function) {
                        alr.find('.ok').click(function () { callback(true) });
                    }
                }
            };
        };

        var _confirm = function (options) {
            alr.html(ahtml); // 复原
            alr.find('.ok').removeClass('btn-primary').addClass('btn-success');
            alr.find('.cancel').show();
            _dialog(options);

            return {
                on: function (callback) {
                    if (callback && callback instanceof Function) {
                        alr.find('.ok').click(function () { callback(true) });
                        alr.find('.cancel').click(function () { return; });
                    }
                }
            };
        };

        var _dialog = function (options) {
            var ops = {
                msg: "提示内容",
                title: "操作提示",
                btnok: "确定",
                btncl: "取消"
            };

            $.extend(ops, options);

            var html = alr.html().replace(reg, function (node, key) {
                return {
                    Title: ops.title,
                    Message: ops.msg,
                    BtnOk: ops.btnok,
                    BtnCancel: ops.btncl
                }[key];
            });

            alr.html(html);
            alr.modal({
                width: 250,
                backdrop: 'static'
            });
        }

        return {
            tip: _tip,
            alert: _alert,
            confirm: _confirm
        }

    }();
});
function getRootPath(){
    //获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp
    var curWwwPath=window.document.location.href;
    //获取主机地址之后的目录，如： uimcardprj/share/meun.jsp
    var pathName=window.document.location.pathname;
    var pos=curWwwPath.indexOf(pathName);
    //获取主机地址，如： http://localhost:8083
    var localhostPaht=curWwwPath.substring(0,pos);
    //获取带"/"的项目名，如：/uimcardprj
    var projectName=pathName.substring(0,pathName.substr(1).indexOf('/')+1);
    return(localhostPaht+projectName);
}
function fileinfo(obj) {
    var email = $("#email").html()
    var type = $(obj).attr('name')
    var filename = $(obj).html()
        $.ajax({
            type:"POST",
            url:"/fileinfo/"+email+"/"+filename,
            data:{
                "path":$("#curpath").html()
            },
            datatype:"json",
            success:function (data) {
                if (data['code']===0){
                    var size = data['size']
                    var suf = "KB"
                    if (size > 1024){
                        size = size/1024
                        suf = "MB"
                        if (size > 1024){
                            size = size/1024
                            suf = "GB"
                        }
                    }
                    $("#size").html(size.toFixed(2) + suf)
                    $("#date").html(data['time'])
                }
            }
        })
    }

