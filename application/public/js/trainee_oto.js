'use strict'

//const {ipcRenderer} = require('electron');
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
	guiderCanvasElement = document.createElement('canvas');

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

	document.body.appendChild(guiderVideoElement);
	document.body.appendChild(guiderCanvasElement);

	PatronusManager.prototype.onPeerOpened= function(id){
		console.log('override!!');
		

	}

	patronusManager = new PatronusManager(SKYWAY_API_KEY);
	patronusManager.setRemoteVideoElement(guiderVideoElement);


}