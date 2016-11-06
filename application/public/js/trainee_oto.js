'use strict'

const {ipcRenderer} = require('electron');
var screenWidth = null;
var screenHeight = null;
var patronusManager = null;
var guiderVideoElement = null;
var guiderCanvasElement = null;
var guiderVideoCanvasElement = null;
var annotationModule = null;

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
		loopGetScreenShotAndSync();
	}

	onDataConnectionReceived(data){
		//ビデオサイズの交換？
		//clickevent表記？
		console.log(data);
		switch(data.act){
			case 'draw_annotation' :
				annotationModule.drawAnnotation(x,y);
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

	onStreamAdded(stream){
		this.startRemoteVideo(stream);
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

	guiderVideoCanvasElement.width = screenWidth;
	guiderVideoCanvasElement.height = screenHeight;
	guiderVideoCanvasElement.style.width = String(screenWidth)+'px';
	guiderVideoCanvasElement.style.height = String(screenHeight)+'px';
	guiderVideoCanvasElement.style.backgroundColor = 'rgba(0,0,0,0)';
	guiderVideoCanvasElement.id = 'remote_video_canvas';
	guiderVideoCanvasElement.style.position="fixed";
	guiderVideoCanvasElement.style.opacity = 0.5;
	guiderVideoCanvasElement.style.zIndex = 0;

	guiderCanvasElement.width = screenWidth;
	guiderCanvasElement.height = screenHeight;
	guiderCanvasElement.style.width = String(screenWidth)+'px';
	guiderCanvasElement.style.height = String(screenHeight)+'px';
	guiderCanvasElement.style.backgroundColor = 'rgba(0,0,0,0)';
	guiderCanvasElement.id = 'remote_canvas';
	guiderCanvasElement.style.position="fixed";
	guiderCanvasElement.style.zIndex = 1;

	document.body.appendChild(guiderVideoCanvasElement);
	document.body.appendChild(guiderCanvasElement);

	setInterval(()=>{
		//ここで画像処理をする
		
		const guiderVideoCanvasElementContext = guiderVideoCanvasElement.getContext('2d');
		guiderVideoCanvasElementContext.drawImage(guiderVideoElement, 0, 0, guiderVideoElement.width, guiderVideoElement.height); 
	},10);


	patronusManager = new PatronusTraineeManager(SKYWAY_API_KEY);
	patronusManager.setRemoteVideoElement(guiderVideoElement);
	annotationModule = new AnnotationModule(guiderCanvasElement,false,patronusManager);
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




