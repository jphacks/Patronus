'use strict'

/*
	initialize
 */
var peer = new Peer({key:SKYWAY_API_KEY});
console.log(peer);

//navigator set
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


//dom element
var chat_video_local = document.getElementById("chat_video");
var chat_video_remote = document.getElementById("chat_video2");

//stream
var local_stream = null;







/*
	peer events
 */
peer.on('open',function(id){
	console.log(id);
	//startVideo();

	// peer.disconnect();
	// peer.destroy();
});


/*
	functions
 */

function startVideo(){
	navigator.getUserMedia({video:true,audio:true},function(localstream){
		//success navigator.getUserMedia
		local_stream = localstream;
		chat_video_local.src = window.URL.createObjectURL(local_stream);
		chat_video_local.play();
	},function(){
		//error navigator.getUserMedia
		console.log('error navigator.getUserMedia');

	});
}
