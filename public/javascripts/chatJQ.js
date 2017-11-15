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
                    makeRequest ('post', 'lobby/send', {transmitter : data.id, receiver : friend, date : Date.now(), text : $('#message').val()}, function(data) {
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
        if (this.id === "search"){
            // Search
        }
      });

      $('#upload').change(function() {
        makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
            if (data.valid) // se valida que el usuario si tenga el token valido
            {
                var uFile = new FormData();
                
                uFile.append('userFile', $('#upload')[0].files[0]);
                uFile.append('transmitter', data.id);
                uFile.append('receiver', $("#send").attr('name'));
                uFile.append('date', Date.now());                
                
                uploadFile(uFile, function(data){
                    if(data.valid){
                        console.log("UPLOAD");
                        //Aqui se mostrara el mensaje de que el archivo ya esta listo
                        alert("Archivo listo");
                    }
                });
                // Aqui voy a mostrar un mensaje emergente avisando al usuario cuando el archivo este listo
                alert("Subiendo archivo");
            }
        });
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

function addMessage(messageJSON){
    let button = "";
    if ($('#send').attr('name') == messageJSON.transmitter){
        if (messageJSON.isFile){
            button = `<div class="col-sm-6 my-2 pull-left">
            <div class="card border border-left-0 border-success bg-light">
            <div class="card-body">
            <h6 class="card-title">${messageJSON.transmitter}</h6>
            <p class="card-text"> ${messageJSON.transmitter} te ha enviado un archivo.</p>     
            <a href="${messageJSON.text}" class="btn btn-warning">Descargar</a>   
            </div></div></div><br><br>`
        }
        else {
            button = `<div class="col-sm-6 my-2 pull-left">
            <div class="card border border-left-0 border-success bg-light">
            <div class="card-body">
            <h6 class="card-title">${messageJSON.transmitter}</h6>
            <p class="card-text"> ${messageJSON.text}</p>  
            </div></div></div><br><br>`
        }
    }
    else{
        if (messageJSON.isFile){
            button = `<div class="col-sm-6 my-2 pull-right">
            <div class="card border border-left-0 border-warning bg-light">
            <div class="card-body">
            <h6 class="card-title">${messageJSON.receiver}</h6>
            <p class="card-text"> ${messageJSON.receiver} has enviado un archivo.</p>     
            <a href="${messageJSON.text}" class="btn btn-warning">Descargar</a>   
            </div></div></div><br><br>`
        }
        else {
            button = `<div class="col-sm-6 my-2 pull-right">
            <div class="card border border-left-0 border-info bg-light">
            <div class="card-body">
            <h6 class="card-title">${messageJSON.receiver}</h6>
            <p class="card-text"> ${messageJSON.text}</p>  
            </div></div></div><br><br>`
        }
        $('#messages').append(button);
    }
}