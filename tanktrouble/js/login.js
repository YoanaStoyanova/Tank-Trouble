(function(){
    login =  function(){
        FB.login(function (response) {
            if(response.status === "connected"){
                FB.api(`/${response.authResponse.userID}`,{fields:"email,name"},function (userInfo) {

                })
                // document.location = "http://localhost:8080/PissTanks/tanktrouble/startGame.html"
            }
        },{scope: 'public_profile,email'})
    };

    document.getElementById("logInBtn").addEventListener("click",function (e) {
        login()
    });
}());

