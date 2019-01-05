(function () {
    var serverAddress = document.location.href;
    var login = function () {
        FB.login(function (response) {
            if (response.status === "connected") {
                FB.api(`/${response.authResponse.userID}`, { fields: "email,name" }, function (userInfo) {
                    //console.log(userInfo);
                    sessionStorage.setItem("name", userInfo.name);
                    fetch(serverAddress + "login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json; charset=utf-8",
                        },
                        body: JSON.stringify(userInfo)
                    }).then(res => res.json())
                        .then(response => {
                            sessionStorage.setItem("userId", response.id);
                            document.location = serverAddress + `${response.goTo}`;
                        });
                    //log in at the server and save the response to session storage or local storage
                });
                // document.location = "http://localhost:8080/PissTanks/tanktrouble/startGame.html"
            }
        }, { scope: 'public_profile,email' })
    };

    document.getElementById("logInBtn").addEventListener("click", function (e) {
        login();
    });
}());
