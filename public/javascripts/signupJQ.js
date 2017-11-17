$(function(){

    $('#error').hide();

    //Leemos algunos eventos
    $('#signup').click(function(){
        $('#error').fadeOut();
        if ($('#username').val() === ""){
            $('#error').html("Usuario no válido.");
            $('#error').fadeIn();
        }
        else if ($('#name').val() === ""){
            $('#error').html("Nombre no válido");
            $('#error').fadeIn();
        }
        else if ($('#password').val() === ""){
            $('#error').html("Constraseña no válida");
            $('#error').fadeIn();
        }
        else 
        {
            makeRequest('post', 'signup', {username : $('#username').val(), password : $('#password').val(), nombre: $('#name').val()}, function(data){
                if (data.valid){
                    window.sessionStorage.userToken = data.token;
                    window.location.href = "/lobby";
                }else{
                    $('#error').fadeOut();
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