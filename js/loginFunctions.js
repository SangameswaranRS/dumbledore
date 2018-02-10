    $('.message a').click(function(){
        $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
    });
    var loginButtonClickAction=function () {
        var userName=document.getElementById('userName').value;
        var password=document.getElementById('password').value;
        var postParamJson={
            userName : userName,
            password :password
        };
        console.log(postParamJson);
        postRequestGenericFunction("http://localhost:5959/login/webLogin",postParamJson,function (err,response) {
            if(err ===null){
                //alert(response.message);
                setCookie('userId',response.userId,1);
                setCookie('userName',userName,1);
                setCookie('token',response.token,1);
                window.location.href="index.html"
            } else{
                alert('Invalid username or password');
            }
        });

    };
    var setCookie=function (cname,cvalue,exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    };
    var getCookie=function (cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };
    var deleteCookie=function () {
        setCookie('userName',"",0);
        setCookie('password',"",0);
        alert('Cookies Related to this site has been deleted successfully')
    };
    var postRequestGenericFunction=function (url,postParams,callBack) {
        var postRequest=new XMLHttpRequest();
        postRequest.responseType='json';
        postRequest.onload=function () {
            var status=postRequest.status;
            if(status ===200){
                console.log('response success, callback');
                callBack(null,postRequest.response);
            }else{
                callBack(postRequest.status,postRequest.response);
            }
        };
        postRequest.open('POST',url,true);
        postRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        postRequest.send(JSON.stringify(postParams));
    };
    var signupButtonClickAction=function () {
        var userName =document.getElementById('regUname').value;
        var password=document.getElementById('reguPass').value;
        var userEmailId =document.getElementById('regEmail').value;
        var regGender=document.getElementById('regGender').value;
        var regAbout=document.getElementById('regAbout').value;
        var postParamJson={
            userName : userName,
            password: password,
            userEmailId :userEmailId,
            gender : regGender,
            aboutString : regAbout,
            dpImgUrl : 'NO_DP'
        };
        console.log(postParamJson);
        if(userName.length>0&&password.length>0&&userEmailId.length>0&&regGender.length>0&&regAbout.length>0) {
            postRequestGenericFunction('http://localhost:5959/login/signUp', postParamJson, function (err, response) {
                if (err === null) {
                    alert('Signup successful logging you in!');
                    setCookie('userId', response.userId, 1);
                    setCookie('userName', userName, 1);
                    setCookie('token', response.token, 1);
                    window.location.href = "images/index.html"
                } else {
                    alert('SignUp unsuccessful, Try Again!!!');
                }
            });
        }else{
            alert('Fill all the fields');
        }
    };
