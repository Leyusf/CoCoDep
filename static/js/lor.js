var clock = '';
var nums = 30;
var btn;
/**
 * Variables
 */
const signupButton = document.getElementById('signup-button'),
    loginButton = document.getElementById('login-button'),
    userForms = document.getElementById('user_options-forms')

/**
 * Add event listener to the "Sign Up" button
 */
signupButton.addEventListener('click', () => {
  userForms.classList.remove('bounceRight')
  userForms.classList.add('bounceLeft')
}, false)

/**
 * Add event listener to the "Login" button
 */
loginButton.addEventListener('click', () => {
  userForms.classList.remove('bounceLeft')
  userForms.classList.add('bounceRight')
}, false)


function checkPwd(pwd){ //8-20 位
  const pwdCheck = /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{8,20}$/;
  if (pwd.length < 1) {
    return 1;
  }else if (pwd.length < 8 ){
    return 2;
  }else if(!pwdCheck.test(pwd)){
    return 3;
  }else{
    return 0;
  }
}


function checkEmail(strEmail){
  if (strEmail.search(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) != -1)
    return true;
  else
      return false;
}

$(function(){
  // 禁止空格
  const inputs = $(":input");
  for(let i=0; i<inputs.length; i++){
    if (inputs[i].id!=="name"){
      inputs[i].addEventListener('keypress', function () {
        if(event.keyCode == 32)event.returnValue = false;
      })
    }
  }
});



$("#login").click(function () {
  const email = $("#login_email").val();
  const pwd = $("#login_pwd").val();
  const captcha = $("#captcha").val();
  const flag = checkPwd(pwd);
  let sub = true
  if (checkEmail(email)===false){
    $("#password_error").css("display","block")
    sub = false
  }
  else if (flag!==0){
    $("#password_error").css("display","block")
    sub = false
  }
  else{
    $("#password_error").css("display","none")
  }
  if (sub===false)
    return;
  $.ajax({
          type:"POST",
          url:"/login/",
          dataType:'json',
          data:{
            "email":email,
            "pwd":pwd,
          },
          success:function(data) {
              if (data['code']===0){
                  setCookie("email",$("#login_email").val(),7) // 7天过期
                  top.location.href = '/ps/'+$("#login_email").val()
              }
              else{
                $("#password_error").css("display","block")
              }
          }
      })
})




$("#register").click(function () {
  $("#email_msg").css("display","none")
  const height = $("#form_r").height()
  let sub = true
  const role = $('input:radio:checked').val()
    let roleCode = -1;
  const name = $("#name").val();
  if (name.length===0){
    sub = false
    $("#name_error").css("display","block")
  }
  else{
    $("#name_error").css("display","none")
  }
  const email = $("#register_email").val()
  if (checkEmail(email)===false){
    $("#email_error").css("display","block")
    sub = false
  }
  else{
    $("#email_error").css("display","none")
  }
  const pwd = $("#pwd1").val()
  if (checkPwd(pwd)!==0){
    $("#pwd_error").css("display","block")
    sub=false
  }
  else{
    $("#pwd_error").css("display","none")
  }
  const pwd2 = $("#pwd2").val()
  if (pwd!==pwd2 && sub===true){
    $("#pwd2_error").css("display","block")
    sub=false
  }
  else{
    $("#pwd2_error").css("display","none")
  }
  if (role!=="student"&&role!=="teacher"){
      $("#role_error").css("display","block")
      sub=false
  }
  else{
      $("#role_error").css("display","none")
      if (role==="student"){
          roleCode = 0
      }
  else{
      roleCode = 1
      }
  }

  if (sub===false){
    const height2 = $("#form_r").height()
    $("#user_options-forms").height($("#user_options-forms").height() + height2 - height)
    return
  }

  $("#role_box").css("display","none")

  $.ajax({
          type:"POST",
          url:"/checkUser/",
          dataType:'json',
          data:{
            "email":email,
            "name":name,
            "pwd":pwd,
              "role":roleCode
          },
          success:function(data) {
              if (data['code']===0){
                $("#r_box").css("display","none")
                $("#code").css("display","block")
                $("#tag_r").css("display","block")
                $("#register").css("display", "none")
                $("#reg").css("display","block")
                btn = $("#resend");
                btn.disabled = true; //将按钮置为不可点击
                btn.val("Resend("+nums+")")
                clock = setInterval("CountDown()", 1000);
                $("#resend").css("display","block")
              }
              else if(data['code']===-1){
                $("#email_msg").html("The email has been registered")
                $("#email_msg").css("display","block")
                const height2 = $("#form_r").height()
                $("#user_options-forms").height($("#user_options-forms").height() + height2 - height)
              }
              else{
                $("#email_msg").html("Email sending failed")
                $("#email_msg").css("display","block")
                const height2 = $("#form_r").height()
                $("#user_options-forms").height($("#user_options-forms").height() + height2 - height)
              }
          }
      })
})


function CountDown() {
  nums--;
  if(nums > 0){
  btn.val("Resend("+nums+")")
  }else{
  btn.val("Resend")
  clearInterval(clock); //清除js定时器
  btn.disabled = false;
  btn.value = 'Resend';
  nums = 30; //重置时间
  }
}


$("#reg").click(function () {
  let code = $("#code").val()
  $.ajax({
          type:"POST",
          url:"/register/"+code,
          dataType:'json',
          success:function(data) {
              if (data['code']===-1){
                $("#code_error").css("display","block")
              }
              else{
                //注册成功
                  setCookie("email",$("#register_email").val(),7) // 7天过期
                top.location.href = '/ps/'+$("#register_email").val()
              }
          }
      })
})

$("#resend").click(function () {
  let email = $("#register_email").val()
  $.ajax({
    type:"POST",
    url:"/email_captcha/"+email,
    dataType: 'json'
  })
  btn.val("Resend("+nums+")")
  clock = setInterval("CountDown()", 1000);
})

function setCookie(cname, cvalue,exdays)		//cookies设置
{
	var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires+";path=/";
}

function getCookie(name)
{
    var arr=document.cookie.split('; ');
    var i=0;
    for(i=0;i<arr.length;i++)
    {
        //arr2->['username', 'abc']
        var arr2=arr[i].split('=');

        if(arr2[0]==name)
        {
            var getC = decodeURIComponent(arr2[1]);
            return getC;
        }
    }

    return '';
}

function removeCookie(name)
{
    setCookie(name, '1', -1);
}