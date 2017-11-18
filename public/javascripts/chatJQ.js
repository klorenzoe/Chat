var mainUser = "";
var friendUser = "";
$(function(){

    if (!window.sessionStorage.userToken){
        window.location.href = "/";
        return;
    }

    makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
        if (data.valid) // se valida que el usuario si tenga el token valido
        {
            mainUser = data.id;
            friendUser = $('#send').attr('name');
            $('#upload').hide();
            $('#messages').css('overflow', 'hidden');
            window.sessionStorage.Count = 0;
            loadMessages();
        }
        else {
            delete windows.sessionStorage.userToken;
            window.location.href = "login";
        }
    });
    
    $(document).on('click', 'button', function(event) {
        if (this.id === "send"){
            if (!$('#message').val()){
                return;
            }

            makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
                if (data.valid) // se valida que el usuario si tenga el token valido
                {
                    makeRequest ('post', 'lobby/send', {transmitter : mainUser, receiver : friendUser, date : Date.now(), text : $('#message').val(), isFile : false}, function(data) {
                        if (data.valid) // el mensaje se envio
                        {
                            window.sessionStorage.Count =0;
                            $('#message').val("");
                            loadMessages();
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
            if (!$('#searchMessage').val()){
                return;
            }
            makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
                if (data.valid) // se valida que el usuario si tenga el token valido
                {
                    makeRequest ('get', 'chat/search', {transmitter : mainUser, receiver : friendUser, word : $('#searchMessage').val()}, function(data) {
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
            $.notify("Preparando la descarga del archivo.", 'info');
            let fileName = this.name;
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
            loadMessages();
        }
      });

      $('#upload').change(function() {
        makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
            if (data.valid) // se valida que el usuario si tenga el token valido
            {
                var uFile = new FormData();
                
                uFile.append('userFile', $('#upload')[0].files[0]);              
                
                uploadFile(uFile, function(data){
                    if(data.valid){
                        makeRequest ('post', 'lobby/send', {transmitter : mainUser, receiver : friendUser, date : Date.now(), text : data.name, isFile : true}, function(data) {});
                        $.notify("Archivo enviado.", 'success');
                    }
                });
                // Aqui voy a mostrar un mensaje emergente avisando al usuario cuando el archivo este listo
                $.notify("Cargando archivo.", 'info');
            }
        });
    });

    window.setInterval(function(){
        loadMessages();
      }, 500);
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
        content  = getPanel(value, friendUser) + content;
    });
    $('#messages').append(content);
    $('#messages').css('overflow', 'hidden');
}

function getPanel(messageJSON, transmitter){
    let panel = "";
    if (transmitter === messageJSON.transmitter){
        if (messageJSON.isFile){
            panel = `<div class="col-sm-8 my-2 pull-left">
            <div class="card  bg-tabs">
            <div class="card-body">
            <h6 class="card-title">${messageJSON.transmitter}</h6>
            <p class="card-text"> Te he enviado un archivo.</p>     
            <button name="${messageJSON.text}" class="btn btn-dark btn-block" id="download"><i class="fa fa-download" aria-hidden="true"></i> Descargar</a>   
            </div></div></div>`
        }
        else {
            panel = `<div class="col-sm-8 my-2 pull-left">
            <div class="card bg-tabs">
            <div class="card-body">
            <h6 class="card-title">${messageJSON.transmitter}</h6>
            <p class="card-text"> ${messageJSON.text}</p>  
            </div></div></div>`
        }
    }
    else{
        if (messageJSON.isFile){
            panel = `<div class="col-sm-8 my-2 pull-right">
            <div class="card  bg-tabs">
            <div class="card-body">
            <h6 class="card-title">Tú</h6>
            <p class="card-text"> Has enviado un archivo.</p>     
            <button name="${messageJSON.text}" class="btn btn-dark btn-block" id="download"><i class="fa fa-download" aria-hidden="true"></i> Descargar</a>   
            </div></div></div>`
        }
        else {
            panel = `<div class="col-sm-8 my-2 pull-right">
            <div class="card  bg-tabs">
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

function loadMessages(){
    makeRequest ('get', 'lobby/validate', {token : window.sessionStorage.userToken}, function(data) {
        if (data.valid) // se valida que el usuario si tenga el token valido
        {
            makeRequest ('get', 'chat/count', {transmitter : mainUser, receiver : friendUser}, function(count){
                if (window.sessionStorage.Count == count.count){
                    return;
                }else{
                    window.sessionStorage.Count = count.count;
                    makeRequest ('get', 'chat/messages', {transmitter : mainUser, receiver : friendUser}, function(data) {
                        if (data.valid) // el mensaje se envio
                        {
                            addMessages(data.messages);
                            scrollDown();
                        }else{
                            $.notify("No podemos recuperar tus mensajes.", 'error');
                        }
                    });
                }
            });
        }
    });
}
