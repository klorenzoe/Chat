$(function(){

    makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
        if (data.valid) // se valida que el usuario si tenga el token valido
        {
            console.log("TOKEN LOADED");
            $('#upload').hide();
        }
        else {
            console.log("INVALID TOKEN");
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
        if (this.id === "file"){
            $('#upload').trigger('click');
        }
      });

      $('#upload').change(function() {
        var userFile = new FormData();
        $.each($('#upload')[0].files, function(i, file) {
            userFile.append('userFile', file);
        });
        uploadFile(userFile, function(data){
            if(data.valid){
                console.log("UPLOAD");
                //Aqui se mostrara el mensaje de que el archivo ya esta listo
                alert("Archivo listo");
            }
        });
        // Aqui voy a mostrar un mensaje emergente avisando al usuario cuando el archivo este listo
        alert("Subiendo archivo");
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

function uploadFile(fileData, successFunction)
{
    $.ajax({
        type : 'post',
        url : 'http://localhost:3000/chat/upload',
        data : fileData,
        asycn : true, 
        contentType: false,
        processData: false,
        dataType: 'json',
        success : successFunction
    });
}