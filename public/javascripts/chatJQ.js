$(function(){


    makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
        if (data.valid) // se valida que el usuario si tenga el token valido
        {
            console.log("TOKEN LOADED");
            $('#upload').hide();
            $('#messages').css('overflow', 'hidden');
        }
        else {
            console.log("INVALID TOKEN");
            window.location.href = "login";
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
        if (this.id === "all"){
            friend = this.name;
            makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
                if (data.valid) // se valida que el usuario si tenga el token valido
                {
                    console.log("VALID TOKEN");
                    makeRequest ('get', 'lobby/messages', {transmitter : data.id, receiver : friend, both : true}, function(data) {
                        if (data.valid) // el mensaje se envio
                        {
                            addMessages(data.messages);
                        }
                    });
                }
            });
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
        url: 'http://192.168.43.167:3000/' + requestLink,
        data: dataJSON,
        dataType: 'json',
        success : successFunction
    });
}

function uploadFile(fileData, successFunction)
{
    $.ajax({
        type : 'post',
        url : 'http://192.168.43.167:3000/chat/upload',
        data : fileData,
        asycn : true, 
        contentType: false,
        processData: false,
        dataType: 'json',
        success : successFunction
    });
}

function addMessages(messagesJSON){
    $('#messages').empty();
    $.each(messagesJSON, function(index, value){
        $('#messages').append(getPanel(value, $('#send').attr('name')));
    });
    $('#messages').css('overflow', 'hidden');
}

function getPanel(messageJSON, transmitter){
    let panel = "";
    if (transmitter === messageJSON.transmitter){
        if (messageJSON.isFile){
            panel = `<div class="col-sm-8 my-2 pull-left">
            <div class="card border border-left-0 border-secondary bg-light">
            <div class="card-body">
            <h6 class="card-title">${messageJSON.transmitter}</h6>
            <p class="card-text"> Te han enviado un archivo.</p>     
            <button name="${messageJSON.text}" class="btn btn-warning" id="donwload">Descargar</a>   
            </div></div></div>`
        }
        else {
            panel = `<div class="col-sm-8 my-2 pull-left">
            <div class="card border border-left-0 border-success bg-light">
            <div class="card-body">
            <h6 class="card-title">${messageJSON.transmitter}</h6>
            <p class="card-text"> ${messageJSON.text}</p>  
            </div></div></div>`
        }
    }
    else{
        if (messageJSON.isFile){
            panel = `<div class="col-sm-8 my-2 pull-right">
            <div class="card border border-right-0 border-secondary bg-light">
            <div class="card-body">
            <h6 class="card-title">${messageJSON.transmitter}</h6>
            <p class="card-text"> Tú has enviado un archivo.</p>     
            <button name="${messageJSON.text}" class="btn btn-warning" id="donwload">Descargar</a>   
            </div></div></div>`
        }
        else {
            panel = `<div class="col-sm-8 my-2 pull-right">
            <div class="card border border-right-0 border-info bg-light">
            <div class="card-body">
            <h6 class="card-title">${messageJSON.transmitter}</h6>
            <p class="card-text"> ${messageJSON.text}</p>  
            </div></div></div>`
        }
    }
    return panel;
}