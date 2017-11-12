$(function () {
    //geramos un token de prueba
    makeRequest('get', 'lobby/generate', { user: "Joe", name : "Abraham Gutierrez"}, function (data) {
        window.sessionStorage.userToken = data.token;
        console.log("TOKEN LOADED");
        // AHora validamos el token y si es valido generamos un boton
        makeRequest('get', 'lobby/validate', { token: window.sessionStorage.userToken }, function (data) {
            if (data.valid) // se valida que el usuario si tenga el token valido
            {
                console.log("VALID TOKEN");
                var list = document.getElementById("usersList");
                list.innerHTML += `<div class="col-sm-6">
                <div class="card">
                <div class="card-body">
                <h4 class="card-title">${data.id}</h4>
                <p class="card-text">${data.name}</p>
                </div><button type="button" class="btn btn-info" id="activeUser" name="thisShouldBeTheID"><i class="fa fa-lg fa-comments" aria-hidden="true"></i> Ver Chat</button>
                </div></div>`
            }
        });

    });

    $(document).on('click', 'button', function (event) {
        if (this.id === "activeUser") {
            document.location.href = '/chat/user/' + this.name;
        }
    });
});


function makeRequest(requestType, requestLink, dataJSON, successFunction) {
    $.ajax({
        type: requestType,
        url: 'http://localhost:3000/' + requestLink,
        data: dataJSON,
        dataType: 'json',
        success: successFunction
    });
}