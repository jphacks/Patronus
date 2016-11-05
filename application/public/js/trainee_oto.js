'use strict'

const {ipcRenderer} = require('electron');
var screenWidth = null;
var screenHeight = null;
var patronusManager = null;
var guiderVideoElement = null;
var guiderCanvasElement = null;

/**
 * [onload windowが読み込まれた時]
 * @return {[type]} [description]
 */
window.onload = function(){
	screenWidth = window.parent.screen.width;
	screenHeight = window.parent.screen.height;

	guiderVideoElement = document.createElement('video');
	guiderVideoCanvasElement = document.createElement('canvas');
	guiderCanvasElement = document.createElement('canvas');

	guiderVideoElement.width = screenWidth;
	guiderVideoElement.height = screenHeight;
	guiderVideoElement.style.width = String(screenWidth)+'px';
	guiderVideoElement.style.height = String(screenHeight)+'px';
	guiderVideoElement.style.backgroundColor = 'rgba(0,0,0,0)'
	guiderVideoElement.id = 'remote_video';
	guiderVideoElement.style.position="fixed";
	guiderVideoElement.style.zIndex = 0;

	guiderVideoElement.width = screenWidth;
	guiderVideoElement.height = screenHeight;
	guiderVideoElement.style.width = String(screenWidth)+'px';
	guiderVideoElement.style.height = String(screenHeight)+'px';
	guiderVideoElement.style.backgroundColor = 'rgba(0,0,0,0)'
	guiderVideoElement.id = 'remote_video';
	guiderVideoElement.style.position="fixed";
	guiderVideoElement.style.zIndex = 0;

	guiderCanvasElement.width = screenWidth;
	guiderCanvasElement.height = screenHeight;
	guiderCanvasElement.style.width = String(screenWidth)+'px';
	guiderCanvasElement.style.height = String(screenHeight)+'px';
	guiderCanvasElement.style.backgroundColor = 'rgba(0,0,0,0)';
	guiderCanvasElement.style.id = 'remote_canvas';
	guiderCanvasElement.style.position="fixed";
	guiderCanvasElement.style.zIndex = 1;

	//document.body.appendChild(guiderVideoElement);
	document.body.appendChild(guiderVideoCanvasElement);
	document.body.appendChild(guiderCanvasElement);

	guiderVideoElement.addEventListener('timeupdate',()=>{
		//ここで画像処理をする
		const guiderVideoCanvasElementContext = guiderVideoCanvasElement.getContext('2d');
		guiderVideoCanvasElement.drawImage(guiderVideoElement, 0, 0, guiderVideoElement.width, guiderVideoElement.height); 
	});

	PatronusManager.prototype.onPeerOpened = function(id){
		console.log('override!!');
		ipcRenderer.send('create_guider_window',{peerId:id,width:screenWidth,height:screenHeight});
	}

	PatronusManager.prototype.onDataConnectionOpend = function(conn){
		loopGetScreenShotAndSync();
	}

	patronusManager.prototype.onDataReceived = function(data){
		//ビデオサイズの交換？
		//clickevent表記？
	}

	patronusManager.prototype.onStreamAdded = function(stream){
		this.startRemoteVideo(stream);
	}


	patronusManager = new PatronusManager(SKYWAY_API_KEY);
	patronusManager.setRemoteVideoElement(guiderVideoElement);


}


function loopGetScreenShotAndSync(){
	ipcRenderer.send('get_screenshot',{})
}


ipcRenderer.on('re_get_screenshot',(event,arg)=>{
	console.log(arg);
	//url化必要そう
	patronusManager.broadcastData2AllConnection({act:"sync_screenshot",img:arg});
	setTimeout(loopGetScreenShotAndSync,1000);
});




