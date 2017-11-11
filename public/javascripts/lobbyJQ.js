$(function(){
    //geramos un token de prueba
    makeRequest ('get', 'lobby/generate', {user : "pepe"}, function(data) { 
        window.sessionStorage.userToken = data.token;
    });

    // AHora validamos el token y si es valido generamos un boton
    makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
        if (data.valid) // se valida que el usuario si tenga el token valido
        {
            window.alert("token valido: " + window.sessionStorage.userToken);
            var list = document.getElementById("usersList");
            list.innerHTML += '<button type="button" class="list-group-item list-group-item-action" id="activeUser" name="juan">juan</button>';
        }
    });    

    $(document).on('click', 'button', function(event) {
        if (this.id === "activeUser"){
            document.location.href = '/chat/' + this.name;
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