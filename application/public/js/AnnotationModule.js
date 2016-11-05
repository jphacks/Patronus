
class AnnotationModule{

	constructor(canvasElement,sender=true,patronus){
		var self = this;
		this.canvas = canvasElement;
		this.reciever=true;
		this.patronus = patronus;
		this.onMove = null;
		this.onUp = null;
		this.onDown = null;
		this.aImage = new Image();
		this.scale = 0.4;
		this.aImage.onload = function(){
			self.initMouseDownEventListener();
			if(sender){
				self.setSenderEventMethod();
			}else{

			}
		}
		this.aImage.src = '../img/finger.png';

	}

	/*
		event listener control method
	 */
	initMouseDownEventListener(){
		const self = this;
		this.canvas.addEventListener('mousedown', onDown);
	}

	setMouseMoveUpEventListener(){
		this.canvas.addEventListener('mousemove',onMove);
		this.canvas.addEventListener('mouseup',onUp);
	}

	removeMouseMoveUpEventListener(){
		this.canvas.removeEventListener('mousemove', onMove);
		this.canvas.removeEventListener('mouseup',onUp);
	}

	/*
		draw method
	 */
	drawAnnotation(x,y){
		const context = this.canvas.getContext('2d');
		context.clearRect(0,0,this.canvas.width,this.canvas.height);
		context.drawImage(this.aImage,0,0,this.aImage.width,this.aImage.height,x,y,this.aImage.width*this.scale,this.aImage.height*this.scale);
	}

	clearCanvas(){
		const context = this.canvas.getContext('2d');
		context.clearRect(0,0,this.canvas.width,this.canvas.height);
	}

	sendDrawAnnotation(x,y){
		this.patronus.broadcastData2AllConnection({
			act:'draw_annotation',
			data:{
				x:x,
				y:y
			}
		});
	}

	sendClearCanvas(){
		this.patronus.broadcastData2AllConnection({
			act:'clear_canvas',
			data:{}
		});
	}

	/*
		event method
	 */

	setSenderEventMethod(){
		var self = this;
		this.onDown = function(e){
			const clientX = e.clientX;
			const clientY = e.clientY;
			// self.drawAnnotation(clientX,clientY);
			self.setMouseMoveUpEventListener();
		}		
	
		this.onMove = function(e){
			const clientX = e.clientX;
			const clientY = e.clientY;
			self.drawAnnotation(clientX,clientY);		
		}

		this.onUp = function(e){
			self.clearCanvas();						
		}
	}

	setDammySenderEventMethod(){
		this.onDown = function(){};
		this.onMove = function(){};
		this.onUp = function(){};
	}
	
}
