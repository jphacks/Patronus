'use strict'

const {ipcRenderer} = require('electron');
var traineeScreenWidth = null;
var traineeScreenHeight = null;
var patronusManager = null;
var localVideoElement = null;
var localCanvasElement = null;
var remoteImageCanvasElement = null;
var remoteImageVideoElement = null;
var annotationModule = null;
var remoteScale = 1.0;

class PatronusGuiderManager extends PatronusManager{

	constructor(apikey){
		super(apikey);
	}


	/*
		override
	 */
	 onDataConnectionReceived(data){
	 	console.log(data.act);
	 	switch(data.act){
	 		case 'sync_screenshot' :
	 			//.imgはurl
	 			console.log('case sync');
	 			const img = new Image();
	 			img.onload = function(){
	 				const remoteImageContext = remoteImageCanvasElement.getContext('2d');
	 				remoteImageContext.drawImage(img,0,0,remoteImageCanvasElement.width,remoteImageCanvasElement.height);
	 			}
	 			img.src = data.img;
	 			break;
	 		default :
	 			console.log('can not find such a act onDataReceived');
	 			//console.log(data);
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
	remoteImageVideoElement = document.createElement('video');

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
	localCanvasElement.style.zIndex = 1;

	remoteImageCanvasElement.width = traineeScreenWidth;
	remoteImageCanvasElement.height = traineeScreenHeight;
	remoteImageCanvasElement.style.width = traineeScreenWidth+"px";
	remoteImageCanvasElement.style.height = traineeScreenHeight+"px";
	remoteImageCanvasElement.style.backgroundColor = 'rgba(0,0,0,0)';
	remoteImageCanvasElement.id = "remote_canvas";
	remoteImageCanvasElement.style.position = "fixed";
	remoteImageCanvasElement.style.zIndex = 0;

	remoteImageVideoElement.width = traineeScreenWidth;
	remoteImageVideoElement.height = traineeScreenHeight;
	remoteImageVideoElement.style.width = String(traineeScreenWidth)+"px";
	remoteImageVideoElement.style.height = String(traineeScreenHeight)+"px";
	remoteImageVideoElement.style.backgroundColor = 'rgba(0,0,0,0';
	remoteImageVideoElement.id = "remote_video";
	remoteImageVideoElement.style.position = "fixed";
	remoteImageVideoElement.style.zIndex = 0;

	//document.body.appendChild(remoteImageVideoElement);	
	document.body.appendChild(remoteImageCanvasElement);
	document.body.appendChild(localCanvasElement);


	patronusManager.localVideoElement = localVideoElement;
	patronusManager.remoteVideoElement = remoteImageVideoElement;
	patronusManager.startLocalVideo({width:traineeScreenWidth,height:traineeScreenHeight},function(){
		//WARNING user mediaの取得状況に注意 => 完全に取得できたイベントの後にやった方がよさそう
		patronusManager.requestConnectionForData(arg.peerId);
		patronusManager.requestConnectionForStream(arg.peerId);
		annotationModule = new AnnotationModule(localCanvasElement,true,patronusManager);
		loopDraw();
	});

	ipcRenderer.send('sync_window_size',{width:traineeScreenWidth,height:traineeScreenHeight});

});

function drawRemote(){
	const context = remoteImageCanvasElement.getContext('2d');
	context.clearRect(0,0,remoteImageCanvasElement.width,remoteImageCanvasElement.height);
	context.drawImage(remoteImageVideoElement,0,0,remoteImageCanvasElement.width,remoteImageCanvasElemet.height);
}

function loopDraw(){
	requestAnimationFrame(loopDraw);
	drawRemote();
}

ipcRenderer.on('remote_scale_up',(event,arg)=>{
	remoteScale = remoteScale - 0.1;
	remoteImageCanvasElemet.width = remoteVideoElement.width * remoteScale;
	remoteImageCanvasElemet.height = remoteVideoElement.height * remoteScale;
});

ipcRenderer.on('remote_scale_down',(event,arg)=>{
	remoteScale = remoteScale + 0.1;
	remoteImageCanvasElemet.width = remoteVideoElement * remoteScale;
	remoteImageCanvasElemet.height = remoteVideoElement * remoteScale;
});


