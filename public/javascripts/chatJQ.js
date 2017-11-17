$(function(){

    if (!window.sessionStorage.userToken){
        window.location.href = "/";
        return;
    }

    makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
        if (data.valid) // se valida que el usuario si tenga el token valido
        {
            console.log("TOKEN LOADED");
            $('#upload').hide();
            $('#messages').css('overflow', 'hidden');
            makeRequest ('get', 'chat/messages', {transmitter : data.id, receiver : $('#send').attr('name')}, function(data) {
                if (data.valid) // el mensaje se envio
                {
                    addMessages(data.messages);
                    scrollDown();
                }else{
                    //Mensaje no enviado
                    $.notify("No podemos recuperar tus mensajes.", 'error');
                }
            });
        }
        else {
            console.log("INVALID TOKEN");
            delete windows.sessionStorage.userToken;
            window.location.href = "login";
        }
    });
    
    $(document).on('click', 'button', function(event) {
        if (this.id === "send"){
            if (!$('#message').val()){
                return;
            }
            friend = this.name;
            makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
                if (data.valid) // se valida que el usuario si tenga el token valido
                {
                    console.log("VALID TOKEN");
                    makeRequest ('post', 'lobby/send', {transmitter : data.id, receiver : friend, date : Date.now(), text : $('#message').val(), isFile : false}, function(data) {
                        if (data.valid) // el mensaje se envio
                        {
                            console.log("MESSAGE SENT");
                            $('#message').val("");
                            loadMessages(friend);
                        }else{
                            $.notify("El mensaje no pudo ser enviado.", 'error');
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
            friend = this.name;
            if (!$('#searchMessage').val()){
                return;
            }
            makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
                if (data.valid) // se valida que el usuario si tenga el token valido
                {
                    console.log("VALID TOKEN");
                    makeRequest ('get', 'chat/search', {transmitter : data.id, receiver : friend, word : $('#searchMessage').val()}, function(data) {
                        if (data.valid) // se recupero algo de la busqueda
                        {
                            addMessages(data.messages);
                        }else{
                            $.notify("Parece que no encontramos nada.", 'error');
                        }
                    });
                }
            });
        }
        if (this.id === "download"){
            fileName = this.name;
            $.notify("Preparando para descargar el archivo.", 'info');
            makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
                if (data.valid) // se valida que el usuario si tenga el token valido
                {
                    $.notify("Tu archivo se está descargando.", 'success');
                    window.location.href = '/chat/download/' + fileName;
                }else{
                    $.notify("No se pudo descargar el archivo.", 'error');
                }
            });
        }
        if (this.id === "all"){
            loadMessages(this.name);
        }
      });

      $('#upload').change(function() {
        makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
            if (data.valid) // se valida que el usuario si tenga el token valido
            {
                let user = data.id;
                var uFile = new FormData();
                
                uFile.append('userFile', $('#upload')[0].files[0]);              
                
                uploadFile(uFile, function(data){
                    if(data.valid){
                        console.log("UPLOADING");
                        makeRequest ('post', 'lobby/send', {transmitter : user, receiver : $('#send').attr('name'), date : Date.now(), text : data.name, isFile : true}, function(data) {});
                        $.notify("Archivo enviado.", 'success');
                    }
                });
                // Aqui voy a mostrar un mensaje emergente avisando al usuario cuando el archivo este listo
                $.notify("Cargando archivo.", 'info');
            }
        });
    });

});

function makeRequest(requestType, requestLink, dataJSON, successFunction)
{
    $.ajax({
        type: requestType,
        url: `http://${window.location.hostname}:3000/` + requestLink,
        data: dataJSON,
        dataType: 'json',
        success : successFunction
    });
}

function uploadFile(fileData, successFunction)
{
    $.ajax({
        type : 'post',
        url : `http://${window.location.hostname}:3000/` + 'chat/upload',
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
    let content = "";
    $.each(messagesJSON, function(index, value){
        content  = getPanel(value, $('#send').attr('name')) + content;
    });
    $('#messages').append(content);
    $('#messages').css('overflow', 'hidden');
    scrollDown();
}

function getPanel(messageJSON, transmitter){
    let panel = "";
    if (transmitter === messageJSON.transmitter){
        if (messageJSON.isFile){
            panel = `<div class="col-sm-8 my-2 pull-left">
            <div class="card border border-left-0 border-secondary bg-light">
            <div class="card-body">
            <h6 class="card-title">${messageJSON.transmitter}</h6>
            <p class="card-text"> Te he enviado un archivo.</p>     
            <button name="${messageJSON.text}" class="btn btn-dark btn-block" id="download"><i class="fa fa-download" aria-hidden="true"></i> Descargar</a>   
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
            <h6 class="card-title">Tú</h6>
            <p class="card-text"> Has enviado un archivo.</p>     
            <button name="${messageJSON.text}" class="btn btn-dark btn-block" id="download"><i class="fa fa-download" aria-hidden="true"></i> Descargar</a>   
            </div></div></div>`
        }
        else {
            panel = `<div class="col-sm-8 my-2 pull-right">
            <div class="card border border-right-0 border-info bg-light">
            <div class="card-body">
            <h6 class="card-title">Tú</h6>
            <p class="card-text"> ${messageJSON.text}</p>  
            </div></div></div>`
        }
    }
    return panel;
}

function scrollDown(){
    $("html, body").animate({ scrollTop: $(document).height() }, 0);
}

function loadMessages(friend){
    makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
        if (data.valid) // se valida que el usuario si tenga el token valido
        {
            console.log("VALID TOKEN");
            makeRequest ('get', 'chat/messages', {transmitter : data.id, receiver : friend}, function(data) {
                if (data.valid) // el mensaje se envio
                {
                    addMessages(data.messages);
                }else{
                    $.notify("No podemos recuperar tus mensajes.", 'error');
                }
            });
        }
    });
}