
//----------------------------------------------Method Declarations-----------------------------------------------------//
var baseURL="http://localhost:5959";
var globalPostId;
var userLat,userLong;
var checkIfLoggedIn=function () {
    if(getCookie('userId')===''||getCookie('userId')===undefined||getCookie('userName')===''||getCookie('userName')===undefined||getCookie('token')===undefined||getCookie('token')===''){
        window.location.href="login.html";
    }else{
        showToast('Logged in as :'+getCookie('userName'))
    }
};

var sayHi =function () {
    console.log('Hello');
    var msg = new SpeechSynthesisUtterance('Hello i am dumbledore');
    window.speechSynthesis.speak(msg);
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

var getNewsFeedPostsAndRender=function () {
    var API_URL=baseURL+"/server/api/getNewsFeedPosts"
    var postParam={
        userId : getCookie("userId")
    };
    postRequestGenericFunction(API_URL,postParam,function (err,data) {
       if(err){
           showToast("Something Went wrong!.. Try again");
       } else{
           // render Page
           var postDivision =document.getElementById("postDivision");
           var innerHtmlText="";
           console.log(data.message);
           for(var i=0;i<data.message.length;i++){
               var epochNum=Number(data.message[i].postTime);
               var time =new Date(epochNum);
               var postId = data.message[i].postId;
               var flag=0;
               for(var i1=0; i1<data.likeInfo.length;i1++){
                   //console.log('Like post consoling');
                   //console.log(data.likeInfo[i1].postId);
                   if(postId === data.likeInfo[i1].postId){
                       flag=1;
                       break;
                   }
               }
               if(flag===0)
                    innerHtmlText+=constructSinglePostElement(data.message[i].userName,data.message[i].postContent,time,data.message[i].likeCount,data.message[i].commentCount,0,postId);
               else
                   innerHtmlText+=constructSinglePostElement(data.message[i].userName,data.message[i].postContent,time,data.message[i].likeCount,data.message[i].commentCount,1,postId);
           }
           postDivision.innerHTML=innerHtmlText;
       }
    });
};

var likePost=function (id) {
  //alert('Id='+id);
  document.getElementById(id).innerHTML='Liked';
  document.getElementById(id).onclick=function () { unlikePost(this.id) };
  var span=document.getElementById(id+"_likeSpan").innerHTML;
  var splitSpan =span.split(" ");
  var likeCount = Number(splitSpan[0]);
  likeCount++;
  //alert(likeCount);

    var commentCount=Number(splitSpan[3]);
    document.getElementById(id+"_likeSpan").innerHTML=likeCount+" likes and "+commentCount+" comments";
  //Api to like Post.
    var API_URL=baseURL+"/server/api/likePost";
    var postParam={
        postId : id,
        userId : getCookie('userId')
    };
    postRequestGenericFunction(API_URL,postParam,function (err,data) {
       if(err){
           showToast('Something went wrong');
           document.getElementById(id).innerHTML='Like';
       } else{
           showToast('You liked this post..')
       }
    });

};

var commentPost=function (id) {
  //alert('Com Id= '+id);
    globalPostId = id;
    renderPostModal();
};

var renderPostModal=function () {
    var API_URL = baseURL+"/server/api/getPostInfo?postId="+globalPostId;
    getRequestGenericFunction(API_URL,function (err,response) {
        if(err !== null){
            showToast("Something went wrong!. Try again");
            reload();
        }else{
            var epochNum=Number(response.postInfo.postTime);
            var time =new Date(epochNum);
            var postDiv="<div class=\"individualDisplayStyle\">"+
            "<img class=\"img-circle smallProfileImage\" src=\"images/post_user_icon.png\">"+
            "<span class=\"postUserNameDisplayStyle\">"+response.postInfo.userName+"</span> <br>"+
            "<span class=\"timeDisplayStyle\">"+time+"</span><br>"+
            "<span class=\"postContentDisplayStyle\">"+response.postInfo.postContent+"</span><br>"+
            "<span class=\"likeCommentDisplayStyle\" id=\""+response.postInfo.postId+"_likeSpan"+"\">"+response.postInfo.likeCount+ " likes "+ "and " +response.postInfo.commentCount +" comments"+"</span><br>"+
            "</div>";
            document.getElementById('commentPostView').innerHTML= postDiv;
            var commentInnerHtmlText="";
            for(var i=0;i<response.commentInfo.length;i++){
                commentInnerHtmlText+=constructSingleCommentElement(response.commentInfo[i].userName,response.commentInfo[i].comments);
            }
            document.getElementById('commentCommentView').innerHTML = commentInnerHtmlText;
        }
    });
};

var addComment=function () {
  var commentContent = document.getElementById('newCommentInput').value;
  var postParams={
      userId : getCookie('userId'),
      postId : globalPostId,
      comments: commentContent
  };
  if(commentContent.length>0) {
      var API_URL = baseURL + '/server/api/postComment';
      postRequestGenericFunction(API_URL, postParams, function (err, response) {
          if (err !== null) {
              showToast('Something went wrong.. Try again');
          } else {
              showToast('Comment posted successfully');
              document.getElementById('commentCommentView').innerHTML += constructSingleCommentElement(getCookie('userName'), commentContent);
              document.getElementById('newCommentInput').value = "";
          }
      });
  }else{
      showToast("Enter comment to post");
  }
};

var flushModalData=function () {
    document.getElementById('commentPostView').innerHTML= "Loading please wait..";
    document.getElementById('commentCommentView').innerHTML = "";
};

var constructSingleCommentElement=function (userName,commentContent) {
    return "<div><span class='likeCommentDisplayStyle'>"+userName+":</span><span class='postContentDisplayStyle'>"+commentContent+"</span></div>"
};

var unlikePost=function (id) {
    //alert('Id='+id);
    document.getElementById(id).innerHTML='Like';
    document.getElementById(id).onclick=function () { likePost(this.id) };
    var span=document.getElementById(id+"_likeSpan").innerHTML;
    var splitSpan =span.split(" ");
    var likeCount = Number(splitSpan[0]);
    likeCount--;
    //alert(likeCount);

    var commentCount=Number(splitSpan[3]);
    document.getElementById(id+"_likeSpan").innerHTML=likeCount+" likes and "+commentCount+" comments";
    //Api to unlike Post.
    var API_URL=baseURL+"/server/api/unlikePost";
    var postParam={
        postId : id,
        userId : getCookie('userId')
    };
    postRequestGenericFunction(API_URL,postParam,function (err,data) {
        if(err){
            showToast('Something went wrong');
            document.getElementById(id).innerHTML='Like';
        } else{
            showToast('You unliked this post..')
        }
    });

};

var constructSinglePostElement=function (userName,postContent,timeString,likeCount,commentCount,isLiked,postId) {
    if(isLiked ===0)
        return "<div class=\"individualDisplayStyle\">"+
            "<img class=\"img-circle smallProfileImage\" src=\"images/post_user_icon.png\">"+
            "<span class=\"postUserNameDisplayStyle\">"+userName+"</span> <br>"+
            "<span class=\"timeDisplayStyle\">"+timeString+"</span><br>"+
            "<span class=\"postContentDisplayStyle\">"+postContent+"</span><br>"+
            "<span class=\"likeCommentDisplayStyle\" id=\""+postId+"_likeSpan"+"\">"+likeCount+ " likes "+ "and " +commentCount +" comments"+"</span><br>"+
            "<button type=\"button\" class=\"btn btn-primary likeButtonParams\" id=\""+postId+"\" onclick=\"likePost(this.id)\">Like</button>"+
            "<button type=\"button\" class=\"btn btn-success commentButtonParams\" id=\""+postId+"\" onclick=\"commentPost(this.id)\" data-toggle=\"modal\" data-target=\"#commentModal\">comment</button>"+
            "</div>";
    else{
        return "<div class=\"individualDisplayStyle\">"+
            "<img class=\"img-circle smallProfileImage\" src=\"images/post_user_icon.png\">"+
            "<span class=\"postUserNameDisplayStyle\">"+userName+"</span> <br>"+
            "<span class=\"timeDisplayStyle\">"+timeString+"</span><br>"+
            "<span class=\"postContentDisplayStyle\">"+postContent+"</span><br>"+
            "<span class=\"likeCommentDisplayStyle\" id=\""+postId+"_likeSpan"+"\">"+likeCount+ " likes "+ "and " +commentCount +" comments"+"</span><br>"+
            "<button type=\"button\" class=\"btn btn-primary likeButtonParams\" id=\""+postId+"\" onclick=\"unlikePost(this.id)\">Liked</button>"+
            "<button type=\"button\" class=\"btn btn-success commentButtonParams\" id=\""+postId+"\" onclick=\"commentPost(this.id)\" data-toggle=\"modal\" data-target=\"#commentModal\">comment</button>"+
            "</div>";
    }
};

var getRequestGenericFunction=function (url,callBack) {
    var getRequest=new XMLHttpRequest();
    getRequest.responseType='json';
    getRequest.open('GET',url,true);
    getRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    getRequest.setRequestHeader('userName',""+getCookie('userName'));
    console.log(getCookie('token'));
    getRequest.setRequestHeader('accessToken',""+getCookie('token'));
    console.log(getRequest);
    getRequest.onload=function () {
        var status=getRequest.status;
        if(status ===200){
            console.log('response success, callback');
            callBack(null,getRequest.response);
        }else{
            callBack(getRequest.status,getRequest.response);
        }
    };
    getRequest.send();
};

var searchUser=function () {
  var searchString=document.getElementById('searchText').value;
  var API_URL = baseURL+'/server/api/queryBasedUserSearch?search='+searchString;
  getRequestGenericFunction(API_URL,function (err,data) {
     if(err){
         showToast('Something Went wrong try again..');
     } else{
         var innerHtmlElement = "<br><br>";
         for(var i=0; i<data.message.length;i++){
             innerHtmlElement+=constructSingleSearchUserElement(data.message[i]);
             innerHtmlElement+="<br>";
         }
         document.getElementById('searchUsers').innerHTML=innerHtmlElement;
     }
  });
};

var constructSingleSearchUserElement=function (userJson) {
    return "<div>"+userJson.userName+"<button type='button' class='btn btn-success followButtonStyle' id='"+userJson.userId+"' onclick='followUser(this.id)'>Follow</button></div>";
};

var followUser = function (id) {
    var postParams={
        userId : getCookie('userId'),
        followingUserId : id
    };
    var API_URL=baseURL+"/server/api/postFollowing";
    postRequestGenericFunction(API_URL,postParams,function (err,response) {
       if(err){
           showToast('Something went wrong');
       } else{
           showToast('User is currently being followed');
       }
    });


};

var requestLocation=function (callback) {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function (location) {
            console.log(location);
            userLat=location.coords.latitude;
            userLong=location.coords.longitude;
            console.log(userLat);
            callback(null,userLat,userLong);
        });
    }
};

var locationAlertPrediction=function (lat,long) {
  var postParams={
      latitude :lat,
      longitude:long
  } ;
  var API_URL=baseURL+"/server/api/locationType";
  postRequestGenericFunction(API_URL,postParams,function (err,response) {
     if(err ===null){
            document.getElementById('zoneAlert').innerHTML="You are in "+response.prediction+" Zone";
     } else{
            showToast('Something wet wrong..')
     }
  });
};

var getTrendingHashTags=function () {
  var API_URL=baseURL+'/server/api/trending';
  //alert(API_URL);
  getRequestGenericFunction(API_URL,function (err,response) {
     if(err===null){
         console.log('Trendig is trending');
         console.log(response);
         document.getElementById('trendingHashTags').innerHTML=response.message;
     } else{
         showToast('Something went wrong..Try again!');
     }
  });
};
//---------------------------------------------------Method Calls---------------------------------------------------------//

checkIfLoggedIn();
getProfileInfo();
getProfessionInfo();
getNewsFeedPostsAndRender();
getTrendingHashTags();
