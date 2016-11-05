'use strict'

const {ipcRenderer} = require('electron');
var traineeScreenWidth = null;
var traineeScreenHeight = null;
var patronusManager = null;
var localVideoElement = null;
var localCanvasElement = null;
var remoteImageCanvasElement = null;

class PatronusGuiderManager extends PatronusManager{

	constructor(apikey){
		super(apikey);
	}


	/*
		override
	 */
	 onDataReceived(data){
	 	switch(data.act){
	 		case 'sync_screenshot' :
	 			//.imgはurl
	 			const remoteImageContext = remoteImageCanvasElement.getContext('2d');
	 			remoteImageContext.drawImage(data.img,0,0,remoteImageCanvasElement.width,remoteImageCanvasElement.height);
	 		break;
	 		default :
	 			console.log('can not find such a act onDataReceived');
	 			console.log(data);
	 		break;
	 	}
	 }

}


window.onload = function(e){
	patronusManager = new PatronusGuiderManager(SKYWAY_API_KEY);

}

ipcRenderer.on('connect_trainee',(event,arg)=>{
	traineeScreenWidth = arg.width;
	traineeScreenHeight = arg.height;

	localVideoElement = document.createElement('video');
	localCanvasElement = document.createElement('canvas');
	remoteImageCanvasElement = document.createElement('canvas');

	//表示はしない
	localVideoElement.width = traineeScreenWidth;
	localVideoElement.height = traineeScreenHeight;
	localVideoElement.style.width = String(traineeScreenWidth) + "px";
	localVideoElement.style.height = String(traineeScreenHeight) + "px";
	localVideoElement.id = "local_video";
	localVideoElement.style.backgroundColor = 'rgba(0,0,0,0)';
	localVideoElement.style.position = "fixed";
	localVideoElement.style.zIndex = 0;

	localCanvasElement.width = traineeScreenWidth;
	localCanvasElement.height = traineeScreenHeight;
	localCanvasElement.style.width = String(traineeScreenWidth)+"px";
	localCanvasElement.style.height = String(traineeScreenHeight)+"px";
	localCanvasElement.style.backgroundColor = 'rgba(0,0,0,0)'; 
	localCanvasElement.id = "local_canvas";
	localCanvasElement.style.position = "fixed";
	localVideoElement.style.zIndex = 1;

	remoteImageCanvasElement.width = traineeScreenWidth;
	remoteImageCanvasElement.height = traineeScreenHeight;
	remoteImageCanvasElement.style.width = traineeScreenWidth+"px";
	remoteImageCanvasElement.style.height = traineeScreenHeight+"px";
	remoteImageCanvasElement.style.backgroundColor = 'rgba(0,0,0,0)';
	remoteImageCanvasElement.id = "remote_canvas";
	remoteImageCanvasElement.style.position = "fixed";
	remoteImageCanvasElement.zIndex = 0;

	document.body.appendChild(remoteImageCanvasElement);
	document.body.appendChild(localCanvasElement);

	patronusManager.localVideoElement = localVideoElement;
	patronusManager.startLocalVideo({width:traineeScreenWidth,height:traineeScreenHeight},function(){
		//WARNING user mediaの取得状況に注意 => 完全に取得できたイベントの後にやった方がよさそう
		patronusManager.requestConnectionForData(arg.peerId);
		patronusManager.requestConnectionForStream(arg.peerId);

	});

});