(function(){
    var serverAddres = "http://localhost:8089/"
    var login = function(){
        FB.login(function (response) {
            if(response.status === "connected"){
                FB.api(`/${response.authResponse.userID}`,{fields:"email,name"},function (userInfo) {
                    console.log(userInfo);
                    fetch(serverAddres+"login",{
                        method: "POST",
                        mode: "no-cors", // 
                        headers: {
                            "Content-Type": "application/json; charset=utf-8",
                        },
                        body: JSON.stringify(userInfo)
                    }).then(res => res.json())
                    .then(response => console.log('Success:', JSON.stringify(response)))
                    //log in at the server and save the responce to session storage or local storage
                });
                // document.location = "http://localhost:8080/PissTanks/tanktrouble/startGame.html"
            }
        },{scope: 'public_profile,email'})
    };

    document.getElementById("logInBtn").addEventListener("click",function (e) {
        login();
    });
}());