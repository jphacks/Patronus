'use strict'
class PatronusManager{
	constructor(apikey,options={}){
		this.peer = new Peer({key:apikey});
		this.peerId = "";
		this.pairId = "";
		this.dataConnectionMap = new Map();
		this.streamConnectionMap = new Map();

		this.localVideoElement = null;
		this.remoteVideoElement = null;

		this.initPeerEventListener();
	}

	initPeerEventListener(){
		const self = this;
		this.peer.on('open',(id)=>{
			self.peerId = id;
			console.log(id);
			//startVideo();
			self.setOnWindowCloseEvent();
			self.onPeerOpened(id);
		});
		//	startVideo();

		this.peer.on('close',function(){
			self.peer.destroy();
			self.onPeerClosed();
		});


		/**
		 * [description] data用のコネクション要求が呼ばれた時のイベント
		 * @param  {[type]} conn){	console.log(conn);	connectedMap.set(conn.peer,conn);	requestConnectionForData(conn);} [description]
		 * @return {[type]}                                                                                                [description]
		 */
		this.peer.on('connection',(conn)=>{
			console.log(conn);
			self.dataConnectionMap.set(conn.peer,conn);
			self.initDataConnectionEvents(conn);
			self.onPeerConnected(conn);
			//requestConnectionForData(conn);
		});


		/**
		 * [description] stream用のコネクション要求が呼ばれた時のイベント
		 * @param  {[type]} conn){} [description]
		 * @return {[type]}           [description]
		 */
		this.peer.on('call',(call)=>{
			console.log(call);
			// call.answer(mediastream);
			self.streamConnectionMap.set(call.peer,call);
			self.initStreamConnectionEvents(call);
			call.answer(self.localStream);
			self.onPeerCalled(call);
		});	
	}


	/**
	 * [initDataConnectionEvents データコネクション用のイベント初期化]
	 * @param  {[type]} conn [description]
	 * @return {[type]}      [description]
	 */
	initDataConnectionEvents(conn){
		const self = this;

		//リモートを引数に
		//各種通信イベントを設定する
		conn.on('open', function() {
	  	// メッセージを受信
		  
	  		conn.on('data', function(data) {
	  			//データ受信イベント
	  			//画像もたぶんオッケー
			    console.log('Received', data);
			    self.onDataConnectionReceived(data);
			});

			conn.on('error',function(e){
				console.log('error data connection'+e);
				self.onDataConnectionError(e);
			})

			conn.on('close',function(){
				console.log('data connection closed');
				self.onDataConnectionClosed();
			});

			self.onDataConnectionOpened(conn);
		  //console.log('send hello');
		  //conn.send('Hello!');
		});	
	}


	/**
	 * [initStreamConnectionEvents streamに関するイベントの初期化]
	 * @param {[type]} call [description]
	 */
	initStreamConnectionEvents(call){
		const self = this;
		console.log(call);
		call.on('stream',(stream)=>{
			//リモートのstreamの追加時に呼ばれる
			console.log(stream);
			//TODO リモートの設定
			//this.startRemoteVideo(stream);
			self.onStreamAdded(stream);
		});
		call.on('close',()=>{
			console.log('close stream connection');
			self.onStreamClosed();
		});
		call.on('error',(e)=>{
			console.log('erron on stream connection');
			console.log(e);
			self.onStreamError(e);
		});
	}

	setOnWindowCloseEvent(){
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


	/**
	 * 通信メソッド 
	 */
	


	/**
	 * [requestConnectionForData データ通信用のコネクションの要求]
	 * @param  {[type]} peerId [description]
	 * @return {[type]}        [description]
	 */
	requestConnectionForData(peerId){
		const conn = this.peer.connect(peerId);
		this.dataConnectionMap.set(peerId,conn);
		this.initDataConnectionEvents(conn);
	}


	/**
	 * [requestConnectionForStream ストリーム共有用のコネクションの要求]
	 * @param  {[type]} peerId [description]
	 * @param  {[type]} stream [description]
	 * @return {[type]}        [description]
	 */
	requestConnectionForStream(peerId){
		const call = this.peer.call(peerId,this.localStream);
		this.streamConnectionMap.set(peerId,call);
		this.initStreamConnectionEvents(call);
	}

	/**
	 * [sendData2EachConnection データをブロードキャスト]
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	broadcastData2AllConnection(data){
		this.dataConnectionMap.forEach((value,key,map)=>{
			value.send(data);
		});
	}

	/**
	 * [sendData2SomeConnection 指定したpeerIdを持つ相手にデータを送る]
	 * @param  {[type]} peerId [description]
	 * @param  {[type]} data   [description]
	 * @return {[type]}        [description]
	 */
	sendData2SomeConnection(peerId,data){
		const target = this.dataConnectionMap.get(peerId);
		if(target){
			target.send(data);
		}else{
			console.log('sendData2SomeConnection : peerId do not exist')
		}
	}


	/**
	 * [setLocalVideoElement 自分のビデオエレメントを登録]
	 * @param {[type]} elm [description]
	 */
	setLocalVideoElement(elm){
		this.localVideoElement = elm;
	}

	/**
	 * [setRemoteVideoElement リモートのビデオエレメントを登録]
	 * @param {[type]} elm [description]
	 */
	setRemoteVideoElement(elm){
		this.remoteVideoElement = elm;
	}


	/**
	 * [startLocalVideo ローカルストリームを取得し設定してあるエレメントに適応]
	 * @return {[type]} [description]
	 */
	startLocalVideo(video_option=true){
		const self = this;
		navigator.mediaDevices.getUserMedia({video:video_option,audio:true}).then(function(localstream){
			//success navigator.getUserMedia
			//console.log(localstream);
			self.localStream = localstream;
			self.localVideoElement.src = window.URL.createObjectURL(localstream);
			self.localVideoElement.play();	
		}).catch(function(e){
			//error navigator.getUserMedia
			console.log('error navigator.getUserMedia');
			console.log(e);
		});
	}

	/**
	 * [startRemoteVideo 設定してあるエレメントにリモートストリームを適応]
	 * @param  {[type]} stream [description]
	 * @return {[type]}        [description]
	 */
	startRemoteVideo(stream){
		//リモートが一つのみしか対応してない
		this.remoteVideoElement.src = window.URL.createObjectURL(stream);
		this.remoteVideoElement.play();
	}



	/**
	 *  need override
	 */
	 onPeerOpened(id){

	 }

	 onPeerClosed(){

	 }

	 onPeerConnected(conn){

	 }

	 onPeerCalled(call){

	 }

	onDataConnectionOpened(conn){

	}

	onDataConnectionReceived(data){

	}

	onDataConnectionClosed(){

	}

	onDataConnectionError(e){

	}

	onStreamClosed(){

	}

	onStreamError(e){

	}

	onStreamAdded(stream){

	}

}
