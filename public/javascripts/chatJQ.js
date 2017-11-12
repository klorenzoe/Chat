$(function(){

    makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
        if (data.valid) // se valida que el usuario si tenga el token valido
        {
            console.log("TOKEN LOADED");
        }
    });
    
    $(document).on('click', 'button', function(event) {
        if (this.id === "send"){
            friend = this.name;
            makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
                if (data.valid) // se valida que el usuario si tenga el token valido
                {
                    console.log("VALID TOKEN");
                    makeRequest ('post', 'lobby/send', {transmitter : data.name, receiver : friend, date : Date.now(), text : $('#message').val()}, function(data) {
                        if (data.valid) // el mensaje se envio
                        {
                            console.log("MESSAGE SENT");
                        }
                    });
                }
            });
        }
        if (this.id === "back"){
            document.location.href ="/lobby/";
        }
      });
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