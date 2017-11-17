$(function(){

    $('#error').hide();
    if (window.sessionStorage.userToken){
        window.location.href = "/lobby";
    }
    //Leemos algunos eventos
    $('#login').click(function(){
        $('#error').fadeOut();
        if ($('#username').val() === ""){
            $('#error').html("Usuario no válido.");
            $('#error').fadeIn();
        }
        else if ($('#password').val() === ""){
            $('#error').html("Constraseña no válida");
            $('#error').fadeIn();
        }
        else 
        {
            makeRequest('post', 'login', {username : $('#username').val(), password : $('#password').val()}, function(data){
                if (data.valid){
                    window.sessionStorage.userToken = null;
                    window.sessionStorage.userToken = data.token;
                    window.location.href = "/lobby"
                }else{
                    $('#error').html(data.message);
                    $('#error').fadeIn();
                }
            });
        }
    });

    function makeRequest(requestType, requestLink, dataJSON, successFunction)
    {
        $.ajax({
            type: requestType,
            url: 'http://localhost:3000/' + requestLink,
            data: dataJSON,
            dataType: 'json',
            success : successFunction
        });
    }

});