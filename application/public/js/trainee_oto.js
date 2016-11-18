'use strict'

const {ipcRenderer,desktopCapturer} = require('electron');
var screenWidth = null;
var screenHeight = null;
var patronusManager = null;
var guiderVideoElement = null;
var localVideoElement = null
var guiderCanvasElement = null;
var guiderVideoCanvasElement = null;
var guiderVideoFaceCanvasElement = null;
var annotationModule = null;
var guiderOpacity = 0.5;
var ctracker = new clm.tracker();
ctracker.init(pModel);
  
class PatronusTraineeManager extends PatronusManager{
	
	constructor(apikey){
		super(apikey);
	}

	/*
		override
	 */
	onPeerOpened(id){
		console.log('override!!');
		ipcRenderer.send('create_guider_window',{peerId:id,width:screenWidth,height:screenHeight});
	}

	onDataConnectionOpened(conn){
		//loopGetScreenShotAndSync();
	}

	onDataConnectionReceived(data){
		//ビデオサイズの交換？
		//clickevent表記？
		console.log(data);
		switch(data.act){
			case 'draw_annotation' :
				annotationModule.drawAnnotation(data.data.x,data.data.y);
			break;
			case 'clear_canvas' :
				annotationModule.clearCanvas();
			break;
			default :
				console.log('can not find such a act');
				console.log(data); 
			break;
		}
	}

	startLocalVideo(callback=function(){}){
		const self = this;
		desktopCapturer.getSources({types:['window','screen']},(error,sources)=>{
			if(error){
				console.log(error);
			}
			for(let i =0; i<sources.length;i++){
				if(sources[i].name == 'Entire screen'){
					navigator.webkitGetUserMedia({
						audio: false,
						video : {
							mandatory: {
								chromeMediaSource: 'desktop',
								chromeMediaSourceId: sources[i].id,
								minWidth: screenWidth,
					            maxWidth: screenWidth,
					            minHeight: screenHeight,
					            maxHeight: screenHeight
							}
						}
					},function(stream){
						console.log(stream);
						self.localStream = stream;
						self.localVideoElement.src = window.URL.createObjectURL(stream);
						self.localVideoElement.onloadedmetadata = function(){
							console.log('callback');
							callback();
						}
						self.localVideoElement.play();
					},function(error){
						console.log(('error on startLocalVideo on trainee_oto.js'))
						console.log(error);
					});
				}
			}
		});
	}

	onStreamAdded(stream){
		this.startRemoteVideo(stream);
		ctracker.start(this.remoteVideoElement);		
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


		// *
		//  * [description] data用のコネクション要求が呼ばれた時のイベント
		//  * @param  {[type]} conn){	console.log(conn);	connectedMap.set(conn.peer,conn);	requestConnectionForData(conn);} [description]
		//  * @return {[type]}                                                                                                [description]
		 
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
			patronusManager.startLocalVideo(function(){
				console.log('answer');
				console.log(self.localStream);
				call.answer(self.localStream);
				self.onPeerCalled(call);
	
			});
		});	
	}



}


/**
 * [onload windowが読み込まれた時]
 * @return {[type]} [description]
 */
window.onload = function(e){
	screenWidth = window.parent.screen.width;
	screenHeight = window.parent.screen.height;

	guiderVideoElement = document.createElement('video');
	localVideoElement = document.createElement('video');
	guiderVideoCanvasElement = document.createElement('canvas');
	guiderVideoFaceCanvasElement = document.createElement('canvas');
	guiderCanvasElement = document.createElement('canvas');

	guiderVideoElement.width = screenWidth;
	guiderVideoElement.height = screenHeight;
	guiderVideoElement.style.width = String(screenWidth)+'px';
	guiderVideoElement.style.height = String(screenHeight)+'px';
	guiderVideoElement.style.backgroundColor = 'rgba(0,0,0,0)'
	guiderVideoElement.id = 'remote_video';
	guiderVideoElement.style.position="fixed";
	guiderVideoElement.style.zIndex = 0;

	localVideoElement.width = screenWidth;
	localVideoElement.height = screenHeight;
	localVideoElement.style.width = String(screenWidth)+'px';
	localVideoElement.style.height = String(screenHeight)+'px';
	localVideoElement.style.backgroundColor = 'rgba(0,0,0,0)'
	localVideoElement.id = 'local_video';
	localVideoElement.style.position="fixed";
	localVideoElement.style.zIndex = 0;

	guiderVideoCanvasElement.width = screenWidth;
	guiderVideoCanvasElement.height = screenHeight;
	guiderVideoCanvasElement.style.width = String(screenWidth)+'px';
	guiderVideoCanvasElement.style.height = String(screenHeight)+'px';
	guiderVideoCanvasElement.style.backgroundColor = 'rgba(0,0,0,0)';
	guiderVideoCanvasElement.id = 'remote_video_canvas';
	guiderVideoCanvasElement.style.position="fixed";
	guiderVideoCanvasElement.style.opacity = 0.5;
	guiderVideoCanvasElement.style.zIndex = 0;

	guiderVideoFaceCanvasElement.width = screenWidth;
	guiderVideoFaceCanvasElement.height = screenHeight;
	guiderVideoFaceCanvasElement.style.width = String(screenWidth)+'px';
	guiderVideoFaceCanvasElement.style.height = String(screenHeight)+'px';
	guiderVideoFaceCanvasElement.style.backgroundColor = 'rgba(0,0,0,0)';
	guiderVideoFaceCanvasElement.id = 'remote_face_video_canvas';
	guiderVideoFaceCanvasElement.style.position="fixed";
	guiderVideoFaceCanvasElement.style.opacity = 0.0;
	guiderVideoFaceCanvasElement.style.zIndex = 0;

	guiderCanvasElement.width = screenWidth;
	guiderCanvasElement.height = screenHeight;
	guiderCanvasElement.style.width = String(screenWidth)+'px';
	guiderCanvasElement.style.height = String(screenHeight)+'px';
	guiderCanvasElement.style.backgroundColor = 'rgba(0,0,0,0)';
	guiderCanvasElement.id = 'remote_canvas';
	guiderCanvasElement.style.position="fixed";
	guiderCanvasElement.style.zIndex = 1;

	document.body.appendChild(guiderVideoCanvasElement);
	document.body.appendChild(guiderVideoFaceCanvasElement);
	document.body.appendChild(guiderCanvasElement);
	//document.body.appendChild(localVideoElement);
	
	loopDraw();

	patronusManager = new PatronusTraineeManager(SKYWAY_API_KEY);
	patronusManager.setLocalVideoElement(localVideoElement);
	patronusManager.setRemoteVideoElement(guiderVideoElement);

	
	annotationModule = new AnnotationModule(guiderCanvasElement,false,patronusManager);
}

var drawVideo = {};
var drawType = "translucent";
//var drawType = "face";
drawVideo["face"] = function(){
	const positions = ctracker.getCurrentPosition();
	const context = guiderVideoFaceCanvasElement.getContext('2d');
	context.clearRect(0,0,guiderVideoFaceCanvasElement.width,guiderVideoFaceCanvasElement.height);
	const w = guiderVideoFaceCanvasElement.width;

	if(positions){
		console.log('draw');
	    context.save();
	    context.beginPath();
	    context.moveTo(w-positions[1][0],positions[1][1]);
	    context.lineTo(w-positions[2][0],positions[2][1]);
	    context.lineTo(w-positions[3][0],positions[3][1]);
	    context.lineTo(w-positions[4][0],positions[4][1]);
	    context.lineTo(w-positions[5][0],positions[5][1]);
	    context.lineTo(w-positions[6][0],positions[6][1]);
	    context.lineTo(w-positions[7][0],positions[7][1]);
	    context.lineTo(w-positions[8][0],positions[8][1]);
	    context.lineTo(w-positions[9][0],positions[9][1]);
	    context.lineTo(w-positions[10][0],positions[10][1]);
	    context.lineTo(w-positions[11][0],positions[11][1]);
	    context.lineTo(w-positions[12][0],positions[12][1]);
	    context.lineTo(w-positions[13][0],positions[13][1]);

	    context.bezierCurveTo(
	      w-(positions[14][0]*2-positions[28][0]),
	      positions[14][1],
	      w-(positions[13][0]*2-positions[28][0]),
	      positions[33][1]*2-positions[7][1],
	      w-positions[33][0],
	      positions[33][1]*2-positions[7][1]      
	      );


	    context.bezierCurveTo(
	      w-(positions[1][0]*2-positions[23][0]),
	      positions[33][1]*2-positions[7][1],
	      w-(positions[0][0]*2-positions[23][0]),
	      positions[0][1],
	      w-positions[1][0],
	      positions[1][1]
	      );

	    
	    context.closePath();

	    context.clip();
	    context.setTransform(-1,0,0,1,0,0);

	    context.drawImage(guiderVideoElement, 0, 0, -guiderVideoFaceCanvasElement.width, guiderVideoFaceCanvasElement.height);
	    context.restore();
	}else{
		console.log('undraw');
	    context.drawImage(guiderVideoElement, 0, 0, -guiderVideoFaceCanvasElement.width, guiderVideoFaceCanvasElement.height);		
	}
}

drawVideo["translucent"] = function(){
	const context = guiderVideoCanvasElement.getContext('2d');
	context.clearRect(0,0,guiderVideoCanvasElement.width,guiderVideoCanvasElement.height);
    context.setTransform(-1,0,0,1,0,0);
	context.drawImage(guiderVideoElement,0,0,-guiderVideoCanvasElement.width,guiderVideoCanvasElement.height);
}

function loopDraw(){
	requestAnimationFrame(loopDraw);
	drawVideo[drawType](); 
	//ここで画層処理 
}


function loopGetScreenShotAndSync(){
	ipcRenderer.send('get_screenshot',{am:"am"});
}


ipcRenderer.on('re_get_screenshot',(event,arg)=>{
	//console.log(arg);
	//url化必要そう
	patronusManager.broadcastData2AllConnection({act:"sync_screenshot",img:arg});

	setTimeout(loopGetScreenShotAndSync,1000);
});

ipcRenderer.on('change_draw_type',(event,arg)=>{
	if(drawType == "face"){
		drawType = "translucent";
		guiderVideoCanvasElement.style.opacity = String(guiderOpacity);
		guiderVideoFaceCanvasElement.style.opacity = "0.0";
		guiderOpacity = 0.5;
	}else{
		drawType = "face";
		guiderVideoFaceCanvasElement.style.opacity 	= String(guiderOpacity);
		guiderVideoCanvasElement.style.opacity 	= '0.0';
		guiderOpacity = 0.5;
	}
});

ipcRenderer.on('change_opacity_up',(event,arg)=>{
	guiderOpacity = guiderOpacity - 0.1;
	if(drawType == 'face'){
		guiderVideoFaceCanvasElement.style.opacity = String(guiderOpacity);
	}else{
		guiderVideoCanvasElement.style.opacity = String(guiderOpacity);
	}
});		

ipcRenderer.on('change_opacity_down',(event,arg)=>{
	guiderOpacity = guiderOpacity + 0.1;
	if(drawType == 'face'){
		guiderVideoFaceCanvasElement.style.opacity = String(guiderOpacity);
	}else{
		guiderVideoCanvasElement.style.opacity = String(guiderOpacity);
	}
});

	