/*** 設定 ***/
// jp.bygc.roppongiclub
var senderID = "847766150620";
var roppongi_host = "http://sample.lnup.jp/roppongi/reg.php";


var loginpage = {
    timer:	null
    // コンストラクタ
   ,initialize: function() {
	loginpage.bindEvents();
    }
   ,bindEvents: function() {
	document.addEventListener('deviceready', loginpage.onDeviceReady, true);
    }
   ,onDeviceReady: function () {
	navigator.splashscreen.hide();
	console.log('Application start...');	
	if (navigator.onLine) {
	    loginpage.doLogin();
	} else {
	    console.log('Device is offline.');
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
		loginpage.showStatus('サーバーにRegIDを保存しました。');
		loginpage.showStatus('会員IDは「'+data.id+'」です。');
	  }
	  ,error: function(data) {
		loginpage.showStatus('サーバーとの通信に失敗しました。');
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
 ,onNotificationGCM: function() {
	loginpage.showStatus('GCMからの通知を取得しました。');
	loginpage.showStatus(e.event);
	loginpage.showStatus('GCMからの通知を解析しています。');
	for (v in e) {
		loginpage.showStatus(v +'::'+e.v);
	}
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