const FORM = $("form"); // set form or other element here
const TYPES = ["input[type=text], input[type=submit]"]; // set which elements get targeted by the focus
const FOCUS = $("#focus"); // focus element

// function for positioning the div
function position(e) {
  // get position
  var props = {
    top: e.offset().top,
    left: e.offset().left,
    width: e.outerWidth(),
    height: e.outerHeight(),
    radius: parseInt(e.css("border-radius"))
  };
  
  // set position
  FOCUS.css({
    top: props.top,
    left: props.left,
    width: props.width,
    height: props.height,
    "border-radius": props.radius
  });
  
  FOCUS.fadeIn(200);
}

FORM.find(TYPES.join()).each(function(i) {
  // when clicking an input defined in TYPES
  $(this).focus(function() {
    el = $(this);

    // adapt size/position when resizing browser
    $(window).resize(function() {
      position(el);
    });

    position(el);
  });
});

FORM.on("focusout", function(e) {
  setTimeout(function() {
    if (!e.delegateTarget.contains(document.activeElement)) {
      FOCUS.fadeOut(200);
    }
  }, 0);
});

        function UploadFile(){
            $("#file").click()
        }
        $("#file").on('change',function (){
            if ($(this).val() != ""){
                let arr=$(this).val().split( '\\' );
                let fileName=arr[arr.length-1];
                let fileType=fileName.split('.')[fileName.split('.').length-1]
                if (fileType!="pdf"&&fileType!="doc"&&fileType!="docx"&&fileType!="zip"){
                    alert('Only accept files in the following formats:\n.pdf .doc .docx .zip')
                    $(this).val(null)
                    return
                }
                $("#fileBox").css('display','block')
                $("#fileBox").attr('placeholder',fileName)
            }
            else{
                $("#fileBox").css('display','none')
                $("#fileBox").attr('placeholder',"")
            }
        })
let gnum = 1
function addSolution(){
    let html = $("#G").html()
    gnum += 1
    let str = '<input type="number" onchange="calculateG(this)" min="0" half placeholder="Group Number" autocomplete="no" id="group'+ gnum +'" num="'+ gnum +'">\n' +
        '            <input type="number" onchange="calculateG(this)" min="0" half placeholder="Member Number" autocomplete="no" id="evegroup'+ gnum +'" num="'+gnum+'">'
    $("#G").html(html + str)
    groupValue.push(0)
    memberValue.push(0)
}

let groupValue = [1]
let memberValue = [studentNum]

function calculateG(obj){
    let num = $(obj).attr("num")
    let tot = 0;
    for (let i=0;i<gnum;i++){
        tot += groupValue[i]*memberValue[i]
    }
    tot = tot - groupValue[num-1]*memberValue[num-1]
    let rem = studentNum - tot
    groupValue[num-1] = $(obj).val()
    memberValue[num-1] = Math.floor(rem/groupValue[num-1])
    $("#evegroup"+num).val(memberValue[num-1])
    let remain = rem - groupValue[num-1]*memberValue[num-1]
    $("#remain").val(remain)
    if ($("#remain").val()!=0){
        $("#addS").css('display','block')
    }
    else{
        $("#addS").css('display','none')
    }
}

function calculateM(obj){
    let num = $(obj).attr("num")
    let tot = 0;
    for (let i=0;i<gnum;i++){
        tot += groupValue[i]*memberValue[i]
    }
    tot = tot - groupValue[num-1]*memberValue[num-1]
    let rem = studentNum - tot
    memberValue[num-1] = $(obj).val()
    groupValue[num-1] = Math.floor(rem/memberValue[num-1])
    $("#group"+num).val(groupValue[num-1])
    let remain = rem - groupValue[num-1]*memberValue[num-1]
    $("#remain").val(remain)
        if ($("#remain").val()!=0){
        $("#addS").css('display','block')
    }
    else{
        $("#addS").css('display','none')
    }
}

function check(){
    if ($("#remain").val()!="0"){
        alert("Remain must be 0")
        return false
    }
    let group = ""
    let member = ""
    for (let i=0;i<gnum;i++){
        group = group + groupValue[i] + ","
        member = member + memberValue[i] + ","
    }
    $("#groupBox").val(group)
    $("#memberBox").val(member)
    return checkDate()
}

function checkDate() {
    var start = new Date($("#start").val()).getTime();
    var end = new Date($("#end").val()).getTime();
    var now = new Date().getTime();
    if (start < now){
        alert("The start date cannot be less than the current date")
        return false;
    }
    else if (start >= end){
        alert("The end date must be more than the start date")
        return false;
    }
    return true;
}
