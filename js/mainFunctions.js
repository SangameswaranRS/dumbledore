
//----------------------------------------------Method Declarations-----------------------------------------------------//
var baseURL="http://localhost:5959";
var checkIfLoggedIn=function () {
    if(getCookie('userId')===''||getCookie('userId')===undefined||getCookie('userName')===''||getCookie('userName')===undefined||getCookie('token')===undefined||getCookie('token')===''){
        window.location.href="login.html";
    }else{
        showToast('Logged in as :'+getCookie('userName'))
    }
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
var logout=function () {
    setCookie('userId',"",0);
    setCookie('userName',"",0);
    setCookie('token',"",0);
    window.location.href="login.html";
};
var postRequestGenericFunction=function (url,postParams,callBack) {
    var postRequest=new XMLHttpRequest();
    postRequest.responseType='json';
    postRequest.open('POST',url,true);
    postRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    postRequest.setRequestHeader('userName',""+getCookie('userName'));
    console.log(getCookie('token'));
    postRequest.setRequestHeader('accessToken',""+getCookie('token'));
    console.log(postRequest);
    postRequest.onload=function () {
        var status=postRequest.status;
        if(status ===200){
            console.log('response success, callback');
            callBack(null,postRequest.response);
        }else{
            callBack(postRequest.status,postRequest.response);
        }
    };
    postRequest.send(JSON.stringify(postParams));
};
var getProfileInfo=function () {
    var postParamJson={
        userId :getCookie('userId')
    };
    var profName=document.getElementById('profName');
    profName.innerHTML=""+getCookie('userName');
    var getProfileRequestAPI_URL="http://localhost:5959/server/api/getUserInitConfig";
    console.log(postParamJson);
    postRequestGenericFunction(getProfileRequestAPI_URL,postParamJson,function (err,response) {
        if(err===null){
            console.log(response);
            var profBodyInnerHtmlContent="";
            profBodyInnerHtmlContent+="Email: "+response.userEmailId+"<br>"+"bio: "+response.aboutString+"<br>Followers:"+response.followers+"<br>Following:"+response.following+"";
            var profBodyContent=document.getElementById('profBodyContent');
            profBodyContent.innerHTML=profBodyInnerHtmlContent;
            if(response.dpImgUrl==='DP_NIL'|| response.dpImgUrl==='NO_DP'){
                document.getElementById('profPhoto').src='images/user_icon_web.png'
            }else{
                document.getElementById('profPhoto').src=response.dpImgUrl;
            }
        } else{
            alert('Something went wrong! Login and try again Later!');
            logout();
        }
    });
};
var getProfessionInfo=function () {
    var postParam={
        userId : getCookie('userId')
    };
    var API_URL='http://localhost:5959/server/api/getProfessionForUserId';
    postRequestGenericFunction(API_URL,postParam,function (err,response) {
        if(err===null){
            var pInnerHml="";
            var data=response.message;
            if(data.length>0){
                for(var i=0;i<data.length;i++){
                    pInnerHml+=data[i].position+" at "+data[i].organization+"<br>";
                }
            }else{
                pInnerHml="No Professional Info Updated.."
            }
            document.getElementById('profession').innerHTML=pInnerHml;
        }else {
            alert('Something went wrong!');
            window.location.href='index.html';
        }
    });
};
var updateBio=function () {
    document.getElementById('bioUpdaterButton').innerHTML="Updating";
    var API_URL="http://localhost:5959/server/api/updateBio";
    var postParam={
        userId : getCookie('userId'),
        newBio : document.getElementById('bioUpdater').value
    };
    if( document.getElementById('bioUpdater').value.length>0) {
        postRequestGenericFunction(API_URL, postParam, function (err, response) {
            if (err === null) {
                //OK - Request success.
                document.getElementById('bioUpdaterButton').innerHTML = "Updated";
            } else {
                document.getElementById('bioUpdaterButton').innerHTML = "Updation failed";
                alert('Something went wrong!')
            }
        });
    }else {
        document.getElementById('bioUpdaterButton').innerHTML = "Updation failed";
    }
};
var addProfession=function () {
    var position=document.getElementById('postionUpdater').value;
    var organization=document.getElementById('organizationUpdater').value;
    var updateProfessionButton=document.getElementById('professionUpdater');
    if(position.length>0&&organization.length>0){
        updateProfessionButton.innerHTML="Updating..";
        var postParam={
            userId :getCookie('userId'),
            position : position,
            organization : organization
        };
        var API_URL='http://localhost:5959/server/api/addProfession';
        postRequestGenericFunction(API_URL,postParam,function (err,data) {
            if(err===null){
                updateProfessionButton.innerHTML="Updated"
            }else{
                updateProfessionButton.innerHTML="Failed - Retry"
            }
        });
    }else {
        updateProfessionButton.innerHTML="Failed - Retry"
    }
};
var reload=function () {
    window.location.href="index.html";
};
function toDataURL(src, callback, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var dataURL;
        canvas.height = this.naturalHeight;
        canvas.width = this.naturalWidth;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
    };
    img.src = src;
    if (img.complete || img.complete === undefined) {
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        img.src = src;
    }
}
var submitPost=function () {
    var createPostJson={
        userId : getCookie("userId"),
        postContent : document.getElementById("postContent").value
    };
    var API_URL = baseURL + "/server/api/uploadPost";
    postRequestGenericFunction(API_URL,createPostJson,function (err,data) {
       if(err){
          showToast("post Creation Failed")
       } else{
           showToast("Shared post..");
           document.getElementById("postContent").value="";
       }
    });

};
var showToast=function (toastString) {
    var x = document.getElementById("snackbar");
    x.innerHTML=toastString;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
};
//---------------------------------------------------Method Calls---------------------------------------------------------//

checkIfLoggedIn();
getProfileInfo();
getProfessionInfo();
