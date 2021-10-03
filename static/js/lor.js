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
  // captcha
})


$("#register").click(function () {
  const height = $("#form_r").height()
  let sub = true
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
  const height2 = $("#form_r").height()
  $("#user_options-forms").height($("#user_options-forms").height() + height2 - height)
  // captcha
})