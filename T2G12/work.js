function checkDate() {
    var start = new Date($("#start").val()).getTime();
    var end = new Date($("#end").val()).getTime();
    var now = new Date().getDate();
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