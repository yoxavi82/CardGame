$(document).ready(function () {
    var url = window.location.search;
    var queryStr = url.split("?")[1];
    document.getElementById("registerbutton").addEventListener("click",function(event){
        event.preventDefault();
        var error="";
        var ok = true;
        var user = $("#register #username");
        if (user.val().length<5 ||user.val().length >12){
        ok=false;
        error+="Username must be between 5 and 12 characters long \n";
        user.css("border-color","red");
        } else{
            user.css("border-color","");
        };
        var email = $("#register #email");
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.val()))){
            ok=false;
            error+="Email format is not valid \n";
            email.css("border-color","red");
        }else{
            email.css("border-color","");

        }
        
        var pass =$("#register #password");
        var check=  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
if(!pass.val().match(check)) {
error+= "Password must have between 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter";
ok=false
pass.css("border-color","red");
} else{
    pass.css("border-color","");

}

        if(!ok) alert(error)
        else document.getElementById("register").submit();
    });

    if (queryStr) {
        let hash = queryStr.split('&');
        for (var i = 0; i < hash.length; i++) {
            params = hash[i].split("=");
            if (params[0] == 'register' && params[1] == 'user_exist') {
                $(".errorregister").html("This user already exist");
                $("#register input").css("border-color", "red");
                $("#at-signup").modal("show");
            } else if (params[0] == 'login' && params[1] == 'user_not_found') {

                $(".errorlogin").html("User and password do not match");
                $("#login input").css("border-color", "red");
                $("#at-login").modal("show");
            } else if (params[0] == 'login' && params[1] == 'empty_field') {

                $(".errorlogin").html("Field can not be empty");
                $("#login input").css("border-color", "red");
                $("#at-login").modal("show");
            } else if (params[0] == 'register' && params[1] == 'empty_field') {
                $(".errorregister").html("Field can not be empty");
                $("#register input").css("border-color", "red");
                $("#at-signup").modal("show");
                
            }
        }
    }
});