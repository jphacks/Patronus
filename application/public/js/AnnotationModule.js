
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
				self.setDammySenderEventMethod();
			}
		}
		this.aImage.src = '../img/finger.png';

	}

	/*
		event listener control method
	 */
	initMouseDownEventListener(){
		const self = this;
		this.canvas.addEventListener('mousedown', self.onDown);
	}

	setMouseMoveUpEventListener(){
		this.canvas.addEventListener('mousemove',self.onMove);
		this.canvas.addEventListener('mouseup',self.onUp);
	}

	removeMouseMoveUpEventListener(){
		this.canvas.removeEventListener('mousemove', self.onMove);
		this.canvas.removeEventListener('mouseup',self.onUp);
	}

	/*
		draw method
	 */
	drawAnnotation(x,y){
		console.log('draw');
		const context = this.canvas.getContext('2d');
		context.clearRect(0,0,this.canvas.width,this.canvas.height);
		context.drawImage(this.aImage,0,0,this.aImage.width,this.aImage.height,x,y,this.aImage.width*this.scale,this.aImage.height*this.scale);
	}

	clearCanvas(){
		console.log('clear');
		const context = this.canvas.getContext('2d');
		context.clearRect(0,0,this.canvas.width,this.canvas.height);
	}

	sendDrawAnnotation(x,y){
		console.log('send draw');
		this.patronus.broadcastData2AllConnection({
			act:'draw_annotation',
			data:{
				x:x,
				y:y
			}
		});
	}

	sendClearCanvas(){
		console.log('send clear');
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
			console.log('ondown');
			const clientX = e.clientX;
			const clientY = e.clientY;
			// self.drawAnnotation(clientX,clientY);
			self.setMouseMoveUpEventListener();
		}		
	
		this.onMove = function(e){
			console.log('onmove');

			const clientX = e.clientX;
			const clientY = e.clientY;
			self.drawAnnotation(clientX,clientY);		
		}

		this.onUp = function(e){
			console.log('onup');

			self.clearCanvas();	
			self.removeMouseMoveUpEventListener();					
		}
	}

	setDammySenderEventMethod(){
		this.onDown = function(){};
		this.onMove = function(){};
		this.onUp = function(){};
	}
	
}
