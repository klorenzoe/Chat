$(function () {
    //geramos un token de prueba
    if (!window.sessionStorage.userToken){
        window.location.href = "/";
        return;
    }
    makeRequest('get', 'lobby/validate', { token: window.sessionStorage.userToken }, function (data) {
        if (data.valid) // se valida que el usuario si tenga el token valido
        {
            console.log("VALID TOKEN");
            $('#userTag').append(data.id);
            makeRequest('get', 'lobby/users', {id: data.id}, function(users){
                
                var list = document.getElementById("usersList");
                $.each(users, function(index, value){
                    list.innerHTML += `<div class="col-sm-6">
                    <div class="card">
                    <div class="card-body">
                    <h4 class="card-title">${value.id}</h4>
                    <p class="card-text">${value.name}</p>
                    </div><button type="button" class="btn btn-info" id="activeUser" name="${value.id}"><i class="fa fa-lg fa-comments" aria-hidden="true"></i> Ver Chat</button>
                    </div></div>`
                });
            });
        }
        else{
            console.log("INVALID TOKEN");
            window.location.href = 'login';
        }
    });

    $(document).on('click', 'button', function (event) {
        if (this.id === "activeUser") {
            document.location.href = '/chat/user/' + this.name;
        }
    });

    $('#close').click(function(){
        delete window.sessionStorage.userToken;
    });
});


function makeRequest(requestType, requestLink, dataJSON, successFunction) {
    $.ajax({
        type: requestType,
        url: `http://${window.location.hostname}:3000/` + requestLink,
        data: dataJSON,
        dataType: 'json',
        success: successFunction
    });
}