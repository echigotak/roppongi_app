/*** 設定 ***/
// jp.bygc.roppongiclub
var senderID = "847766150620";
var roppongi_host = "http://spynk.com/sample/roppongi/reg.php";

var utility = {
    dataSet: function(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
	return;
   }
   ,dataGet: function(key) {
	var d = localStorage.getItem(key);
	return d ? JSON.parse(d) : null;
   }
}

var roppongi = {
   data: null
  ,init: function() {
	document.addEventListener('deviceready', roppongi.onDeviceReady, true);
   }
  ,onDeviceReady: function() {
	navigator.splashscreen.hide();
	this.data = utility.dataGet("roppongi");
	if (!this.data) {
	  loginpage.getID(roppongi.set);
	} else {
	  this.showID();
	}
  }
  ,set: function(data) {
	roppongi.data = data;
	utility.dataSet("roppongi", data);
	roppongi.showID();
  }
  ,showID: function() {
	$('#kaiin_id').html(roppongi.data.id);
	$.mobile.changePage("#showid", { transition: "slide"});
  }
}

var loginpage = {
    timer:	null
   ,cb:		null
    // コンストラクタ
   ,getID: function (cb) {
	this.cb = cb;
	if (navigator.onLine) {
	    loginpage.doLogin();
	} else {
	    loginpage.timer
		 = setTimeout(loginpage.checkOnline,1500);
	}
    }
   ,showStatus: function(status) {
	$('#app-status-ul').append(
	  $('<li>').html(status)
	);
    }
   ,checkOnline: function() {
	if (navigator.onLine) {
	    loginpage.doLogin();
	} else {
	    loginpage.timer
		 = setTimeout(loginpage.checkOnline,1500);
	}
    }
   ,doLogin: function() {
	loginpage.showStatus('オンラインであることを確認しました。');
	loginpage.showStatus('RegIDを取得します。');
	notif.getNotificationID();
    }
   ,registrationSuccess: function( regid, platform) {
	loginpage.showStatus('RegIDを取得しました。');
	loginpage.registerWithServer( device.uuid, regid, platform)
    }
   ,registerWithServer: function( uuid, regid, platform) {
	postdata = {
	   'uuid'	: uuid
	  ,'regid'	: regid
	  ,'platform'	: platform
	}
	//console.log(postdata);
	$.ajax({
	   url : roppongi_host
	  ,cache: false
	  ,data: postdata
	  ,beforeSend: function() {
		loginpage.showStatus('サーバーにRegIDを保存しています。');
	  }
	  ,success: function(data) {
		//loginpage.showStatus('サーバーとの通信を解析しています。');
		//for (v in data) loginpage.showStatus(v +'::'+data[v]);
		switch (data.code) {
		  case 'success':
			loginpage.showStatus('サーバーにRegIDを保存しました。');
			loginpage.cb({
			   'id'		: data.id
			  ,'uuid'	: uuid
			  ,'regid'	: regid
			  ,'platform'	: platform			  
			});
			break;
		  case 'error':
		  default:
			loginpage.showStatus('サーバーエラー。');
		}
	  }
	  ,error: function(data) {
		loginpage.showStatus('サーバーとの通信に失敗しました。');
		loginpage.showStatus(data);
		console.log('Ajax Error:');
		console.log(data);
	  },complete: function(data) {
	  }
	})
    }
}

var notif = {
  getNotificationID: function() {
    try 
    { 
      pushNotification = window.plugins.pushNotification;
      if (device.platform == 'android' || device.platform == 'Android') {
	    pushNotification.register(notif.successHandler, notif.errorHandler, {"senderID":senderID,"ecb":"notif.onNotificationGCM"});
      } else {
	    pushNotification.register(notif.tokenHandler, notif.errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"notif.onNotificationAPN"});	// required!
      }
    }
    catch(err) 
    { 
	loginpage.showStatus('ページ内でエラーが発生しました。');
	loginpage.showStatus("エラー: " + err.message);
    } 
  } // getNotificationID
 ,onNotificationGCM: function(e) {
	loginpage.showStatus('GCMからの通知を取得しました。');
	//loginpage.showStatus(e.event);
	loginpage.showStatus('GCMからの通知を解析しています。');
	//for (v in e) loginpage.showStatus(v +'::'+e[v]);
	switch( e.event )
	{
	    case 'registered':
		if ( e.regid.length > 0 ) {
			loginpage.registrationSuccess( e.regid, 'android');
		}
		break;
	    case 'message':
		loginpage.showStatus("メッセージを取得しました。");
		loginpage.showStatus(e.payload.message);
		// debug
		alert(e.payload.message);
		break;
	    case 'error':
		loginpage.showStatus('エラーが発生しました。');
		loginpage.showStatus("エラー: " + e.msg);
		break;
	    default:
		loginpage.showStatus('不明なイベントを取得しました。');
	    break;
	}
  }
 ,onNotificationAPN: function(e) {}
 ,tokenHandler: function(result) {
	loginpage.showStatus('APNSからの通知を取得しました。');
	registrationSuccess( result, 'iOS');
  }
 ,successHandler: function(result) {
	loginpage.showStatus('通信成功。');
	loginpage.showStatus(result);
  }
 ,errorHandler: function(error) {
	loginpage.showStatus('通信失敗。');
	loginpage.showStatus(error);
  }
}


/*** エラー時に出力 ***/
window.onerror = function (e, file, num) {
    console.log('/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/');
    console.log(e);
    console.log('Error on ' + file + ' at Line: ' + num);
    console.log('/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/');
};

//$(document).ready(function() {   roppongi.onDeviceReady(); });
//$(document).ready(function() { roppongi.autologin();});