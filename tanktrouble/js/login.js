(function () {
    var serverAddres = "http://localhost:8080/"
    var login = function () {
        FB.login(function (response) {
            if (response.status === "connected") {
                FB.api(`/${response.authResponse.userID}`, { fields: "email,name" }, function (userInfo) {
                    console.log(userInfo);
                    fetch(serverAddres + "login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json; charset=utf-8",
                        },
                        body: JSON.stringify(userInfo)
                    }).then(res => res.json())
                        .then(response => {
                            sessionStorage.setItem("userId", response.id);
                            document.location = serverAddres + `${response.goTo}`;
                        });
                    //log in at the server and save the responce to session storage or local storage
                });
                // document.location = "http://localhost:8080/PissTanks/tanktrouble/startGame.html"
            }
        }, { scope: 'public_profile,email' })
    };

    document.getElementById("logInBtn").addEventListener("click", function (e) {
        login();
    });
}());