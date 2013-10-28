var Menu = function(parent){
	var s = {
			
			elements 	: {},
			
			images 		: {},
			
			imagesPath 	: 'img/menu/',
			
			parent 		: parent,
			
			ini : function(){
				s.setImages();
			},
			
			setImages : function(){
				s.images['ini1'] = s.createImage(s.imagesPath+'ini1.png');
				s.images['ini2'] = s.createImage(s.imagesPath+'ini2.png');
				s.images['ini_tit'] = s.createImage(s.imagesPath+'ini_tit.png');
				s.images['bt_iniciar'] = s.createImage(s.imagesPath+'bt_iniciar.png');
				s.images['back1'] = s.createImage(s.imagesPath+'back1.png');
				s.images['d1'] = s.createImage(s.imagesPath+'d1.png');
				s.images['d2'] = s.createImage(s.imagesPath+'d2.png');
				s.images['bt_vai'] = s.createImage(s.imagesPath+'bt_vai.png');
				
				s.images['cinematic1'] = s.createImage(s.imagesPath+'cinematic/1.png');
				s.images['cinematic2'] = s.createImage(s.imagesPath+'cinematic/2.png');
				s.images['cinematic3'] = s.createImage(s.imagesPath+'cinematic/3.png');
				//s.images['cinematic4'] = s.createImage(s.imagesPath+'cinematic/4.png');
				
			},
			
			getImage : function(name){
				return s.images[name];
			},
			
			createImage : function(src){
				var img = new Image();
				img.src = src;
				return img;
			},
			
			start : function(io){
				
				
				s.elements['back1'] = new iio.Rect(512, 384, 1024, 768)
												.addImage(s.getImage('back1'));
				
				s.elements['ini1'] = new iio.Rect(516, 166, 1033, 332)
											.addImage(s.getImage('ini1'))
											.enableKinematics();
				
				s.elements['ini2'] = new iio.Rect(516, 598, 1033, 362)
											.addImage(s.getImage('ini2'))
											.enableKinematics();
				
				s.elements['ini_tit'] = new iio.Rect(515, 360, 1058, 219)
											.addImage(s.getImage('ini_tit'))
											.enableKinematics();
				
				s.elements['bt_iniciar'] = new iio.Rect(500, 600, 376, 83)
											.addImage(s.getImage('bt_iniciar'))
											.enableKinematics();
				
				s.elements['d1'] = new iio.Rect(512, -240, 1024, 423)
											.addImage(s.getImage('d1'))
											.enableKinematics();
				
				
				s.elements['d2'] = new iio.Rect(512, 1000, 1024, 423)
											.addImage(s.getImage('d2'))
											.enableKinematics();
				
				io.addObj(s.elements['back1']);
				io.addObj(s.elements['ini1']);
				io.addObj(s.elements['ini2']);
				io.addObj(s.elements['ini_tit']);
				io.addObj(s.elements['bt_iniciar']);
				io.addObj(s.elements['d1']);
				io.addObj(s.elements['d2']);
				
				var step = 0, start = false;
				io.setFramerate(60, function(){
					if(start){
						step++;
						if(step == 52){
							
							s.elements['ini1'].setVel(0, 0);
							s.elements['ini2'].setVel(0, 0);
							s.elements['ini_tit'].setVel(0, 0);
							s.elements['bt_iniciar'].setVel(0, 0);
							
							s.elements['d1'].setVel(0, 10);
							s.elements['d2'].setVel(0, -10);
							
							
						}else if(step == 60){
							
							s.elements['d1'].setVel(0, 0);
							s.elements['d2'].setVel(0, 0);
							
							start = false;
							io.cancelFramerate();
							s.startCinematic(io);
							
						}
					}
				});
				
				io.canvas.addEventListener('mousedown', function(event){
					if(iio.intersects(s.elements['bt_iniciar'], new  iio.Rect(io.getEventPosition(event), 1, 1))){
						s.elements['ini1'].setVel(0, -10);
						s.elements['ini2'].setVel(0, 10);
						s.elements['ini_tit'].setVel(0, 10);
						s.elements['bt_iniciar'].setVel(0, 10);
						start = true;
					}else if(s.elements['bt_vai'] && s.elements['bt_vai'].styles.alpha > 0 && iio.intersects(s.elements['bt_vai'], new  iio.Rect(io.getEventPosition(event), 1, 1))){
						
						s.elements['cinematic1'].fadeOut(1);
						s.elements['bt_vai'].fadeOut(1);
						
						io.cancelFramerate();
						s.close(io);
					}
				});
					
			},
			
			startCinematic : function(io){
				s.elements['bt_vai'] = new iio.Rect(512, 550, 213, 86)
											.addImage(s.getImage('bt_vai'))
											.setAlpha(.0);
				
				
				s.elements['cinematic1'] = new iio.Rect(512, 300, 795, 293)
											.addImage(s.getImage('cinematic1'))
											.setAlpha(.0);
				
				io.addObj(s.elements['bt_vai']);
				io.addObj(s.elements['cinematic1']);
				
				var step = 0;
				io.setFramerate(60, function(){
					
					step++;
					
					if(step <= 100){
						s.elements['cinematic1'].fadeIn(step/100);
						s.elements['bt_vai'].fadeIn(step/100);
					}
					
					if(step == 150){
						s.elements['cinematic1'].addImage(s.getImage('cinematic2'));
					}else if(step == 300){
						s.elements['cinematic1'].addImage(s.getImage('cinematic3'));
						io.cancelFramerate();
					}
					
				});
			},
			
			//qqqqqqqqqqq merda
			close : function(io, time, callback, end){
				
				if(time){
					io.addObj(s.elements['d1']);
					io.addObj(s.elements['d2']);
					s.elements['d1'].setPos(512, -180);
					s.elements['d2'].setPos(512, 910);
				}
				s.elements['d1'].setVel(0, 15);
				s.elements['d2'].setVel(0, -15);
				
				var step = 0;
				io.setFramerate(60, function(){
					step += 0.1;
					if(step > 2.4){
						io.cancelFramerate();
						setTimeout(function(){
							
							if(typeof callback == 'function'){
								callback();
							}
							if(!end){
								io.setFramerate(60);
								s.parent.start();
								
								s.elements['d1'].setVel(0, -15);
								s.elements['d2'].setVel(0, 15);
								s.elements['back1'].setAlpha(0.).fadeOut(1);
								
								var id = setInterval(function(){
									if(s.elements['d1'].pos.y < -240){
										s.elements['d1'].setVel(0, 0);
										s.elements['d2'].setVel(0, 0);
										clearInterval(id);
									}
								}, 500);
							}
						}, time?time:0);
					}
				});
			},
			
			removeElements : function(){
				for(var i in s.elements){
					delete s.elements[i];
				}
				
				s.elements = {};
			}
	};
	
	
	s.ini();
	return s;
};