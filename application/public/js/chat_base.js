'use strict'

/*
	initialize
 */
var peer = new Peer({key:SKYWAY_API_KEY});
var peerId = "";
var pairId = "";
var dataConnectionMap = new Map();
var streamConnectionMap = new Map();

console.log(peer);



//dom element
var chat_video_local = document.getElementById("chat_video");
var chat_video_remote = document.getElementById("chat_video2");


//debug
var id_input = document.getElementById("id_input");
var connect_button = document.getElementById("connect_button");
var send_button = document.getElementById("send_button");
connect_button.addEventListener('click', function(e){
	//connectingArray.push(id_input.value);
	requestConnectionForData(id_input.value);
	//console.log(local_stream);
	//requestConnectionForStream(id_input.value,local_stream);
});
send_button.addEventListener('click',function(e){
	dataConnectionMap.forEach(function(value,key,map){
		console.log('send hello');
		value.send({a:"aaaaa",b:"bbbbb"});
	});
});
/////////////

//stream
var local_stream = null;






/*
	set peer events
 */
peer.on('open',function(id){
	peerId = id;
	console.log(id);
	//startVideo();
	setOnCloseEvent();
});
//	startVideo();

peer.on('close',function(){
	peer.destroy();
});


/**
 * [description] data用のコネクション要求が呼ばれた時のイベント
 * @param  {[type]} conn){	console.log(conn);	connectedMap.set(conn.peer,conn);	requestConnectionForData(conn);} [description]
 * @return {[type]}                                                                                                [description]
 */
peer.on('connection',function(conn){
	console.log(conn);
	dataConnectionMap.set(conn.peer,conn);
	setDataConnectionEvents(conn);
	//requestConnectionForData(conn);
});


/**
 * [description] stream用のコネクション要求が呼ばれた時のイベント
 * @param  {[type]} conn){} [description]
 * @return {[type]}           [description]
 */
peer.on('call',function(call){
	console.log(call);
	// call.answer(mediastream);
	streamConnectionMap.set(call.peer,call);
	setStreamConnectionEvents(call);
	call.answer();
});




/*
	set some events
 */

function setOnCloseEvent(){	
	window.onbeforeunload = function(){
		//peer.disconnect();
		peer.destroy();
	};
	window.onclose = function(){
		//peer.disconnect();
		peer.destroy();
	};
	window.onreset = function(){
		//peer.disconnect();
		peer.destroy();
	};
}

function setDataConnectionEvents(conn){
	//リモートを引数に
	//各種通信イベントを設定する
	conn.on('open', function() {
  	// メッセージを受信
	  
  		conn.on('data', function(data) {
  			//データ受信イベント
  			//画像もたぶんオッケー
		    console.log('Received', data);
		});

		conn.on('error',function(e){
			console.log('error data connection'+e);
		})

		conn.on('close',function(){
			console.log('data connection closed');
		});

	  //console.log('send hello');
	  //conn.send('Hello!');
	});	
	
}

function setStreamConnectionEvents(call){
	call.on('stream',function(stream){
		//リモートのstreamの追加時に呼ばれる
		console.log(stream);
		startRemoteVideo(stream);
	});
	call.on('close',function(){
		console.log('close stream connection');
	});
	call.on('error',function(e){
		console.log('erron on stream connection');
		console.log(e);
	});
}


/*
	functions
 */

function startLocalVideo(){
	navigator.mediaDevices.getUserMedia({video:true,audio:true}).then(function(localstream){
		//success navigator.getUserMedia
		//console.log(localstream);
		local_stream = localstream;
		chat_video_local.src = window.URL.createObjectURL(local_stream);
		chat_video_local.play();	
	}).catch(function(e){
		//error navigator.getUserMedia
		console.log('error navigator.getUserMedia');
		console.log(e);
	});
}

function startRemoteVideo(stream){
	//remote_stream = stream;
	chat_video_remote.src = window.URL.createObjectURL(stream);
	chat_video_remote.play();
}


/**
 * [connectRemoteWindow 一度呼べばオッケー] 
 * @param  {[type]} peerId [description]
 * @return {[type]}        [description]
 */
function requestConnectionForData(peerId){
	const conn = peer.connect(peerId);
	dataConnectionMap.set(peerId,conn);
	setDataConnectionEvents(conn);
}


function requestConnectionForStream(peerId,stream){
	const call = peer.call(peerId,stream);
	streamConnectionMap.set(peerId,call);
	setStreamConnectionEvents(call);
}



//startLocalVideo();


