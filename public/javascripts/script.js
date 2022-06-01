window.onload = function(){
    document.getElementById("leaderboard").addEventListener("click",function(){
        console.log("ajax ok");
        $.ajax({
            async: true,
            type: "GET",
            dataType: "JSON",
            url: "/leaderboard",
            data: { pos: 0 },
            success: resposta
        });
        function resposta(datos) {
            console.log("res ok");
            console.log(datos);
    
    
        }
    });
}