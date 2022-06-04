$(document).ready(function () {
    var url = window.location.search;
    var queryStr = url.split("?")[1];

    if (queryStr) {
        let hash = queryStr.split('&');
        for (var i = 0; i < hash.length; i++) {
            params = hash[i].split("=");
            if (params[0] == 'register' && params[1] == 'user_exist') {
                $(".errorregister").html("This user already exist");
                $("#register input").css("border-color", "red")
                $("#at-signup").addClass("show")
                $("#at-signup").toggle();
            } else if (params[0] == 'login' && params[1] == 'user_not_found') {

                $(".errorlogin").html("User and password do not match");
                $("#login input").css("border-color", "red")
                $("#at-login").addClass("show");
                $("#at-login").toggle();
            } else if (params[0] == 'login' && params[1] == 'empty_field') {

                $(".errorlogin").html("Field can not be empty");
                $("#login input").css("border-color", "red")
                $("#at-login").addClass("show");
                $("#at-login").toggle();
            } else if (params[0] == 'register' && params[1] == 'empty_field') {
                $(".errorregister").html("Field can not be empty");
                $("#register input").css("border-color", "red")
                $("#at-signup").addClass("show")
                $("#at-signup").toggle();
                
            }
        }
    }
});