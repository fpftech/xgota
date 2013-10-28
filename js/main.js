//referência http://iioengine.com
var Main = new function(){
	
	var s = {
		
		gravity 		: 0.5,
			
		screenId 		: 'screen',

		hero 			: null,
		
		heroJumpSpeed 	: -13,
		heroSpeed 		: 5,
		heroLaserSpeed 	: 30,
		heroLife 		: 3,
		heroHurted 		: true,
		
		LEFT 			: 1,
		RIGHT 			: 2,
		SPACE 			: 4,
		UP 				: 8,
		FALL 			: 16,
		DOWN 			: 32,
		keyCode 		: 2,
		
		move 			: {},
		
		step 			: 0,
		
		pos 			: 0,
		
		isFalling 		: true,
		
		blockControl 	: true,
		
		moveIndex 		: {
			'stopped-right' 	: 0,
			'stopped-left' 		: 1,
			'walk-right-start' 	: 2,
			'walk-right' 		: 3,
			'walk-right-end' 	: 4,
			'walk-left-start' 	: 5,
			'walk-left' 		: 6,
			'walk-left-end' 	: 7,
			'shoot-right' 		: 8,
			'shoot-left' 		: 9,
			'jump-right' 		: 10,
			'jump-left' 		: 11,
			'hurt-right' 		: 12,
			'hurt-left' 		: 13,
			'ididit' 			: 14,
			'ididitagain' 		: 15,
			'imawesome' 		: 16,
			'gameover' 			: 17,
			'cineend' 			: 18,
			'shooting-right' 	: 19,
			'shooting-left' 	: 20,
			'laser-explode' 	: 21
		},
		
		config 			: null,
		
		currentLevel 	: 1,
		
		menu 			: null,
		
		io 				: null,
		
		enemies 		: {},
		
		enemiesDead 	: 0,
		
		playSoundStage 	: true,
		
		lifeBoss 		: 6,
		
		laserSound 		: document.getElementById('laser'),
		
		bitEx 			: document.getElementById('bit_ex'),
		
		nanicoVader 	: document.getElementById('dv'),
		
		hurt 			: document.getElementById('hurt'),
		
		ini : function(){
			
			s.centralizer();
			window.addEventListener('resize', s.centralizer);
			
			s.enemiesSetImages();
			s.heroSetImg();
			
			s.config = levels;
			s.heroControl();
			s.menu = new Menu(s);
			
		},
		
		startMenu : function(){
			iio.start(function(io){
				s.io = io;
				s.menu.start(io);
			}, s.screenId);
		},
		
		start : function(){
			
			s.blockControl = false;
			
			document.getElementById('topElements').style.display = 'block';
			
			s.io.cancelFramerate();
			s.heroCreate(s.io);
			s.stageCreate(s.io);
			s.enemiesStage(s.io);
			
			if(s.playSoundStage){
				document.getElementById('sound').play();
				document.getElementById('sound').addEventListener('ended', function() {
				    //this.currentTime = 0;
				    //this.play();
				}, false);
				
				s.playSoundStage = false;
			}
		},
		
		getConfig : function(){
			return s.config[s.currentLevel-1];
		},
		
		stageCreate : function(io){
			
			io.setBGPattern(s.stageGetBg());
			
			var 
			wall = [{
						width 			: 2048,
						height 			: 200,
						y 				: 860,
						x 	 			: 0,
						background 		: ''
					},{
						width 			: 100,
						height 			: 1536,
						y	 			: 0,
						x 	 			: 1070,
						background 		: ''
					},{
						width 			: 100,
						height 			: 1536,
						y	 			: 0,
						x 	 			: -45,
						background 		: ''
					}],
			plataform = null, plataforms = s.getConfig().plataforms;
			
			//paredes padrão
			for(var i  in wall){
				if(typeof wall[i] == 'object'){
					io.addObj(	
							plataform = 
								new iio.Rect(wall[i].x, wall[i].y, wall[i].width, wall[i].height)
						    	.setFillStyle('rgba(0,0,0,.0)')
						    	.enableKinematics()
						    	.setBound('top', 0, function(o){
						    		return true;
						    	})
						    	.setBound('right', wall[i].width, function(o){
						    		return true;
						    	}).setBound('left', 0, function(o){
						    		return true;
						    	}));
					
					io.addToGroup('plataform', plataform);
					io.addToGroup('wall', plataform);
				}
			}
			
			for(var i  in plataforms){
				if(typeof plataforms[i] == 'object'){
					io.addObj(	
						plataform = 
							new iio.Rect(plataforms[i].x, plataforms[i].y, plataforms[i].width, plataforms[i].height)
					    	.setFillStyle('rgba(0,0,0,.0)')
					    	.enableKinematics()
					    	.setBound('top', 0, function(o){
					    		return true;
					    	}));
					io.addToGroup('plataform', plataform);
				}
			}
						
			io.setCollisionCallback('player', 'plataform', function(player, plataform){
				
				if(
						((player.top()+player.height) <= (plataform.top()+plataform.height)) &&
						(s.pos <= s.hero.pos.y) &&
						(player.left()+player.width>plataform.left()+50) &&
						(player.left()<plataform.width+plataform.left()-50) && 
						(plataform.bounds.top)
				){
					player.vel.y = 0;
					player.pos.y = (plataform.pos.y - plataform.height/2) - player.height/2;
					
					if(s.isFalling){
						s.heroFall();
					}
					
					s.isFalling = false;
				}else if(player.left()<=plataform.left() && plataform.bounds.left){
					player.pos.x = plataform.pos.x-player.width/2-48;
				}else if(player.left()>=(plataform.left()+plataform.width-30) && plataform.bounds.right){
					player.pos.x = (plataform.pos.x+plataform.width/2+33);
				}
				
			});
		},
		
		stageGetBg : function(){
			return s.getConfig().background;
		},
		
		heroCreate : function(io){
			
			//x, y, width, height
			delete s.hero;
			s.hero = new iio.Rect(100, 700, 75,75)
							.enableKinematics()
							.setVel(0, 0)
							.setAcc(0, s.gravity)
							.setBounds(0, io.canvas.width, io.canvas.height, 0, function(o){
					    		return true;
					    	});
			
			s.hero.addAnim(s.heroGetImg('stopped-right'));
			s.hero.addAnim(s.heroGetImg('stopped-left'));
			s.hero.addAnim(s.heroGetImg('walk-right-start'));
			s.hero.addAnim(s.heroGetImg('walk-right'));
			s.hero.addAnim(s.heroGetImg('walk-right-end'));
			s.hero.addAnim(s.heroGetImg('walk-left-start'));
			s.hero.addAnim(s.heroGetImg('walk-left'));
			s.hero.addAnim(s.heroGetImg('walk-left-end'));
			s.hero.addAnim(s.heroGetImg('shoot-right'));
			s.hero.addAnim(s.heroGetImg('shoot-left'));
			s.hero.addAnim(s.heroGetImg('jump-right'));
			s.hero.addAnim(s.heroGetImg('jump-left'));
			s.hero.addAnim(s.heroGetImg('hurt-right'));
			s.hero.addAnim(s.heroGetImg('hurt-left'));
			
			io.addObj(s.hero);
			var stepEnemie = 0, stepBoss = 0;
			
			io.setFramerate(30, function(a){
				s.pos = s.hero.pos.y;
				s.hero.nextAnimFrame();
				s.heroSprite();
				
				if(s.hero.vel.y > 0 && !s.isFalling){
					s.hero.setAnimKey((s.keyCode==s.LEFT)?s.moveIndex['stopped-left']:s.moveIndex['stopped-right']);
					s.isFalling = true;
				}
				
				
				var en = io.getGroup('enemie');
				stepEnemie++;
				if(en.length && stepEnemie%10 == 0){
					stepEnemie = 0;
					for(var i in en){
						if(typeof en[i] == 'object'){
							en[i].nextAnimFrame();
						}
					}
				}
				
				var boss = io.getGroup('boss');
				stepBoss++;
				if(typeof boss[0] == 'object'){
					if(stepBoss%3 == 0){
						boss[0].nextAnimFrame();
					}
					s.bossAi(io);
					if(stepBoss > 310) stepBoss = 0;
				}
			});
			
			io.addToGroup('player', s.hero);
			
			io.addToGroup('laser', new iio.Rect(-500, -500, 1,1));
			io.setCollisionCallback('laser', 'wall', function(laser, wall){
				laser.vel.x = 0;
				io.rmvObj(laser);
				io.rmvFromGroup(laser, 'laser');
				laser.shrink(0.8);
			});
			
			s.heroSetLife();
		},
		
		heroSetLife : function(){
			document.getElementById('topElements').style.display = 'block';
			document.getElementById('life').style.width = 63*s.heroLife+'px';
		},
		
		heroSetImg : function(){
			var i = 0;
			
			//stopped-right
			s.move[s.moveIndex['stopped-right']] = [];
			for( i = 1 ; i <= 14 ; i++ ){
				s.move[s.moveIndex['stopped-right']].push(s.heroCreateImg(s.heroGetImgPath()+'stopped-right/'+i+'.png'));
			}
			
			//stopped-left
			s.move[s.moveIndex['stopped-left']] = [];
			for( i = 1 ; i <= 14 ; i++ ){
				s.move[s.moveIndex['stopped-left']].push(s.heroCreateImg(s.heroGetImgPath()+'stopped-left/'+i+'.png'));
			}
			
			//walk-right-start
			s.move[s.moveIndex['walk-right-start']] = [];
			for( i = 1 ; i<= 4 ; i++ ){
				s.move[s.moveIndex['walk-right-start']].push(s.heroCreateImg(s.heroGetImgPath()+'walk-right/'+i+'.png'));
			}
			
			//walk-right
			s.move[s.moveIndex['walk-right']] = [];
			for( i = 5 ; i<= 14 ; i++ ){
				s.move[s.moveIndex['walk-right']].push(s.heroCreateImg(s.heroGetImgPath()+'walk-right/'+i+'.png'));
			}
			
			//walk-right-end
			s.move[s.moveIndex['walk-right-end']] = [];
			for( i = 15 ; i<= 18 ; i++ ){
				s.move[s.moveIndex['walk-right-end']].push(s.heroCreateImg(s.heroGetImgPath()+'walk-right/'+i+'.png'));
			}
			
			//walk-left-start
			s.move[s.moveIndex['walk-left-start']] = [];
			for( i = 1 ; i<= 4 ; i++ ){
				s.move[s.moveIndex['walk-left-start']].push(s.heroCreateImg(s.heroGetImgPath()+'walk-left/'+i+'.png'));
			}
			
			//walk-left
			s.move[s.moveIndex['walk-left']] = [];
			for( i = 5 ; i<= 14 ; i++ ){
				s.move[s.moveIndex['walk-left']].push(s.heroCreateImg(s.heroGetImgPath()+'walk-left/'+i+'.png'));
			}
			
			//walk-left-end
			s.move[s.moveIndex['walk-left-end']] = [];
			for( i = 15 ; i<= 18 ; i++ ){
				s.move[s.moveIndex['walk-left-end']].push(s.heroCreateImg(s.heroGetImgPath()+'walk-left/'+i+'.png'));
			}
			
			//shoot-right
			s.move[s.moveIndex['shoot-right']] = [];
			for( i = 1 ; i<= 11 ; i++ ){
				s.move[s.moveIndex['shoot-right']].push(s.heroCreateImg(s.heroGetImgPath()+'shoot-right/'+i+'.png'));
			}
			
			//shoot-left
			s.move[s.moveIndex['shoot-left']] = [];
			for( i = 1 ; i<= 11 ; i++ ){
				s.move[s.moveIndex['shoot-left']].push(s.heroCreateImg(s.heroGetImgPath()+'shoot-left/'+i+'.png'));
			}
			
			
			//jump-right
			s.move[s.moveIndex['jump-right']] = [];
			for( i = 1 ; i<= 6 ; i++ ){
				s.move[s.moveIndex['jump-right']].push(s.heroCreateImg(s.heroGetImgPath()+'jump-right/'+i+'.png'));
			}
			
			//jump-left
			s.move[s.moveIndex['jump-left']] = [];
			for( i = 1 ; i<= 6 ; i++ ){
				s.move[s.moveIndex['jump-left']].push(s.heroCreateImg(s.heroGetImgPath()+'jump-left/'+i+'.png'));
			}
			
			
			//shooting-right
			s.move[s.moveIndex['shooting-right']] = [];
			for( i = 1 ; i<= 3 ; i++ ){
				s.move[s.moveIndex['shooting-right']].push(s.heroCreateImg(s.heroGetImgPath()+'shooting-right/'+i+'.png'));
			}
			
			//shooting-left
			s.move[s.moveIndex['shooting-left']] = [];
			for( i = 1 ; i<= 3 ; i++ ){
				s.move[s.moveIndex['shooting-left']].push(s.heroCreateImg(s.heroGetImgPath()+'shooting-left/'+i+'.png'));
			}
			
			//hurt-right
			s.move[s.moveIndex['hurt-right']] = [];
			for( i = 1 ; i<= 11 ; i++ ){
				s.move[s.moveIndex['hurt-right']].push(s.heroCreateImg(s.heroGetImgPath()+'hurt-right/'+i+'.png'));
			}
			
			//hurt-left
			s.move[s.moveIndex['hurt-left']] = [];
			for( i = 1 ; i<= 11 ; i++ ){
				s.move[s.moveIndex['hurt-left']].push(s.heroCreateImg(s.heroGetImgPath()+'hurt-left/'+i+'.png'));
			}
			
			//laser-explode
			s.move[s.moveIndex['laser-explode']] = [];
			for( i = 1 ; i<= 6 ; i++ ){
				s.move[s.moveIndex['laser-explode']].push(s.heroCreateImg(s.heroGetImgPath()+'laser-explode/'+i+'.png'));
			}
			
			//medal
			s.move[s.moveIndex['ididit']] = [];
			s.move[s.moveIndex['ididitagain']] = [];
			s.move[s.moveIndex['imawesome']] = [];
			
			var img1 = new Image(), img2, img3;
			img1.width = 600;
			img1.height = 600;
			img1.src = 'img/level/b/1.png';
			
			img2 = img1.cloneNode(true);
			img3 = img1.cloneNode(true);
			
			img2.src = 'img/level/b/2.png';
			img3.src = 'img/level/b/3.png';
			
			s.move[s.moveIndex['ididit']].push(img1);
			s.move[s.moveIndex['ididitagain']].push(img2);
			s.move[s.moveIndex['imawesome']].push(img3);
			
			//game over
			s.move[s.moveIndex['gameover']] = [];
			var img = new Image();
			img.width = 795;
			img.height = 293;
			img.src = 'img/menu/GAMEOVER.png';
			
			s.move[s.moveIndex['gameover']].push(img);
			
			//cine end
			s.move[s.moveIndex['cineend']] = [];
			img1 = new Image();
			img1.width = 1024;
			img1.height = 768;
			img1.src = 'img/menu/cine-end/1.png',
			
			img2 = img1.cloneNode(true);
			img2.src = 'img/menu/cine-end/2.png';
			
			s.move[s.moveIndex['cineend']].push(img1);
			s.move[s.moveIndex['cineend']].push(img2);
		},
		
		heroCreateImg : function(src){
			var img = new Image();
			img.width = 75;
			img.height = 75;
			img.src = src;
			return img;
		},
		
		heroGetImg : function(type){
			type = type?type:'stopped-right';
			return s.move[s.moveIndex[type]];
		},
		
		heroGetImgPath : function(){
			return 'img/character/hero/1/';
		},
		
		heroWalk : function(type){
			type = type?type:s.LEFT;
			
			if(type == s.LEFT){
				s.hero.setAnimKey((s.hero.vel.y != 0)?s.moveIndex['stopped-left']:s.moveIndex['walk-left-start']);
				s.hero.vel.x = -s.heroSpeed;
				s.keyCode = s.LEFT;
				s.step = 1;
			}else{
				s.hero.setAnimKey((s.hero.vel.y != 0)?s.moveIndex['stopped-right']:s.moveIndex['walk-right-start']);
				s.hero.vel.x = s.heroSpeed;
				s.keyCode = s.RIGHT;
				s.step = 1;
			}
		},
		
		heroJump : function(){
			s.hero.setAnimKey(s.keyCode==s.LEFT?s.moveIndex['jump-left']:s.moveIndex['jump-right']);
			s.keyCode = s.UP+s.keyCode;
			s.step = 1;
		},
		
		heroFall : function(){
			
			if(s.hero.vel.x == 0){
				s.hero.setAnimKey(s.keyCode==s.LEFT?s.moveIndex['jump-left']:s.moveIndex['jump-right']);
				s.keyCode = s.FALL+s.keyCode;
				s.step = 1;
			}else{
				s.heroWalk(s.keyCode);
			}
		},
		
		heroShoot : function(){
			s.hero.setAnimKey(s.keyCode==s.LEFT?s.moveIndex['shoot-left']:s.moveIndex['shoot-right']);
			s.keyCode = s.SPACE+s.keyCode;
			s.step = 1;
		},
		
		heroShooting : function(){
			
			var img = s.heroGetImg((s.keyCode == s.SPACE+s.LEFT)?'shooting-left':'shooting-right');
			iio.start(function(io){
				
				s.laserSound.play();
				
				var 
				shoot = new iio.Rect(s.hero.pos.x, s.hero.pos.y-1, 75,75)
										.enableKinematics()
										.setVel((s.keyCode == (s.SPACE+s.LEFT))?-s.heroLaserSpeed:s.heroLaserSpeed, 0)
										.setBounds(0, io.canvas.width, io.canvas.height, 0, function(o){
								    		return true;
								    	}).addAnim(img);
				
				io.addObj(shoot);
				io.addToGroup('laser', shoot);
				
			}, s.screenId);
			
			
		},
		
		heroHurt : function(){
			s.hero.setAnimKey(s.keyCode==s.LEFT?s.moveIndex['hurt-left']:s.moveIndex['hurt-right']);
			s.step = 1;
		},
		
		heroControl : function(io){
			
			window.addEventListener('keydown', function(event){
				
				if(s.blockControl){
					return 0;
				}
				
				if (iio.keyCodeIs('left arrow', event) && s.hero.vel.x >= 0){
					s.heroWalk(s.LEFT);
				}else if (iio.keyCodeIs('right arrow', event) && s.hero.vel.x <= 0){
					s.heroWalk(s.RIGHT);
				}else if (iio.keyCodeIs('up arrow', event) && !s.isFalling && (s.keyCode == s.LEFT || s.keyCode == s.RIGHT)){
					s.heroJump();
				}else if (iio.keyCodeIs('down arrow', event) && !s.isFalling){
					s.pos = s.hero.pos.y;
					s.hero.pos.y = s.hero.pos.y+20;
					s.isFalling = true;
				}else if (iio.keyCodeIs('space', event) && s.step == 0){
					s.heroShoot();
					s.heroShooting();
				}
				
				//check for pause
	            if (iio.keyCodeIs('pause', event) || iio.keyCodeIs('p', event)){
	            	//.pauseFramerate();
	            }
			});
			
			window.addEventListener('keyup', function(event){
				
				if(s.blockControl){
					return 0;
				}
				
				if ((iio.keyCodeIs('left arrow', event) || iio.keyCodeIs('right arrow', event)) && s.hero.vel.x != 0){
					
					s.hero.vel.x = 0;
					
					if(s.hero.vel.y == 0){
						s.hero.setAnimKey((s.keyCode==s.LEFT)?s.moveIndex['walk-left-end']:s.moveIndex['walk-right-end']);
						s.step = 1;
					}
				}
			});
		},
		
		heroSprite : function(){
			
			if(s.step == 0){
				return 0;
			}
			
			if(s.step == 6 && (s.keyCode==s.FALL+s.LEFT || s.keyCode==s.FALL+s.RIGHT)){
				s.keyCode = (s.keyCode==(s.FALL+s.LEFT))?s.LEFT:s.RIGHT;
				s.hero.setAnimKey((s.keyCode==s.LEFT)?s.moveIndex['stopped-left']:s.moveIndex['stopped-right']);
				s.step = 0;
			}else if(s.step == 6 && (s.keyCode==(s.UP+s.LEFT) || s.keyCode==(s.UP+s.RIGHT))){
				s.keyCode = (s.keyCode==(s.UP+s.LEFT))?s.LEFT:s.RIGHT;
				s.hero.setAnimKey((s.keyCode==s.LEFT)?s.moveIndex['stopped-left']:s.moveIndex['stopped-right']);
				s.hero.vel.y = s.heroJumpSpeed;
				s.step = 0;
				s.isFalling = true;
			}else if(s.step == 11 && (s.keyCode==s.SPACE+s.LEFT || s.keyCode==s.SPACE+s.RIGHT)){
				s.keyCode = (s.keyCode==(s.SPACE+s.LEFT))?s.LEFT:s.RIGHT;
				if(s.hero.vel.x == 0){
					s.hero.setAnimKey((s.keyCode==s.LEFT)?s.moveIndex['stopped-left']:s.moveIndex['stopped-right']);
					s.step = 0;
				}else{
					s.heroWalk(s.keyCode);
				}
			}else if(s.hero.vel.x == 0 && s.step == 4 && (s.keyCode==s.LEFT || s.keyCode==s.RIGHT)){
				s.hero.setAnimKey((s.keyCode==s.LEFT)?s.moveIndex['stopped-left']:s.moveIndex['stopped-right']);
				s.step = 0;
			}else if(s.hero.vel.x != 0 && (s.keyCode==s.LEFT || s.keyCode==s.RIGHT)){
				if(s.hero.vel.y != 0){
					s.step = 0;
				}else if(s.step > 4){
					s.hero.setAnimKey((s.keyCode==s.LEFT)?s.moveIndex['walk-left']:s.moveIndex['walk-right']);
					s.step = 0;
				}
			}else if(s.keyCode==s.LEFT+s.FALL+s.SPACE){
			   s.keyCode=s.LEFT;
			   s.step = 0;
			   s.hero.setAnimKey(s.moveIndex['stopped-left']);
		   }else if(s.keyCode==s.RIGHT+s.FALL+s.SPACE){
			   s.keyCode=s.RIGHT;
			   s.step = 0;
			   s.hero.setAnimKey(s.moveIndex['stopped-right']);
		   }else if(s.step == 11){
			   if(s.hero.vel.x == 0){
				   s.hero.setAnimKey((s.keyCode==s.LEFT)?s.moveIndex['stopped-left']:s.moveIndex['stopped-right']);
			   }else{
				   s.hero.setAnimKey((s.keyCode==s.LEFT)?s.moveIndex['walk-left']:s.moveIndex['walk-right']);
			   }
			   s.step = 0;
		   }
			
			if(s.step != 0){
				s.step++;
			}
		},
	
		centralizer : function(){
			var d = document.getElementById(s.screenId);
			d.style.left = (window.innerWidth-d.width)/2+'px';
			
			var d = document.getElementById('topElements'),
				w = parseInt(d.style.width.replace(/[A-z]/g, ''));
			d.style.left = (window.innerWidth-w)/2+'px';
		},
		
		enemiesGerPath : function(){
			return 'img/character/enemies/';
		},
		
		enemiesSetImages : function(){
			
			var i = 0;
			
			//blue
			s.enemies['blue-explode'] = [];
			for(i = 1; i <= 4 ; i++){
				s.enemies['blue-explode'].push(s.heroCreateImg(s.enemiesGerPath()+'blue/explode/'+i+'.png'));
			}
			
			s.enemies['blue-walk-right'] = [];
			for(i = 1; i <= 2 ; i++){
				s.enemies['blue-walk-right'].push(s.heroCreateImg(s.enemiesGerPath()+'blue/walk-right/'+i+'.png'));
			}
			
			s.enemies['blue-walk-left'] = [];
			for(i = 1; i <= 2 ; i++){
				s.enemies['blue-walk-left'].push(s.heroCreateImg(s.enemiesGerPath()+'blue/walk-left/'+i+'.png'));
			}
			
			//green
			s.enemies['green-explode'] = [];
			for(i = 1; i <= 4 ; i++){
				s.enemies['green-explode'].push(s.heroCreateImg(s.enemiesGerPath()+'green/explode/'+i+'.png'));
			}
			
			s.enemies['green-walk-right'] = [];
			for(i = 1; i <= 4 ; i++){
				s.enemies['green-walk-right'].push(s.heroCreateImg(s.enemiesGerPath()+'green/walk-right/'+i+'.png'));
			}
			
			s.enemies['green-walk-left'] = [];
			for(i = 1; i <= 4 ; i++){
				s.enemies['green-walk-left'].push(s.heroCreateImg(s.enemiesGerPath()+'green/walk-left/'+i+'.png'));
			}
			
			//red
			s.enemies['red-explode'] = [];
			for(i = 1; i <= 4 ; i++){
				s.enemies['red-explode'].push(s.heroCreateImg(s.enemiesGerPath()+'red/explode/'+i+'.png'));
			}
			
			s.enemies['red-walk-right'] = [];
			for(i = 1; i <= 2 ; i++){
				s.enemies['red-walk-right'].push(s.heroCreateImg(s.enemiesGerPath()+'red/walk-right/'+i+'.png'));
			}
			
			s.enemies['red-walk-left'] = [];
			for(i = 1; i <= 2 ; i++){
				s.enemies['red-walk-left'].push(s.heroCreateImg(s.enemiesGerPath()+'red/walk-left/'+i+'.png'));
			}
			
			//vader
			s.enemies['vader-walk'] = [];
			for(i = 1; i <= 10 ; i++){
				s.enemies['vader-walk'].push(s.heroCreateImg(s.enemiesGerPath()+'vader/walk/'+i+'.png'));
			}

			s.enemies['vader-stand'] = [];
			for(i = 1; i <= 9 ; i++){
				s.enemies['vader-stand'].push(s.heroCreateImg(s.enemiesGerPath()+'vader/stand/'+i+'.png'));
			}

			s.enemies['vader-attack'] = [];
			for(i = 1; i <= 3 ; i++){
				s.enemies['vader-attack'].push(s.heroCreateImg(s.enemiesGerPath()+'vader/attack/'+i+'.png'));
			}

			s.enemies['vader-blink'] = [];
			for(i = 1; i <= 8 ; i++){
				s.enemies['vader-blink'].push(s.heroCreateImg(s.enemiesGerPath()+'vader/blink/'+i+'.png'));
			}
			
		},
		
		enemiesGetImage : function(type){
			return s.enemies[type];
		},
		
		enemiesAdd : function(type, io){
			//x, y, width, height
			
			var vel = {'blue' : 3, 'red' : 3, 'green' : 5}, di = [-1,1];
			var enemie = new iio.Rect(500, -100, 75,75)
							.enableKinematics()
							.setVel(0, 0)
							.setAcc(0, s.gravity)
							.setBound('left', 0, function(o){
								o.setAnimKey(0);
								o.vel.x = o.vel.x*(-1);
					    		return true;
					    	})
					    	.setBound('right', io.canvas.width, function(o){
					    		o.setAnimKey(1);
					    		o.vel.x = o.vel.x*(-1);
					    		return true;
					    	});
			
			var dir = di[((Math.floor(Math.random() * 100))>=50)?1:0]; 
			
			enemie.addAnim(s.enemiesGetImage(type+'-walk-right'));
			enemie.addAnim(s.enemiesGetImage(type+'-walk-left'));
			enemie.addAnim(s.enemiesGetImage(type+'-explode'));
			
			enemie.setAnimKey((dir < 0)?1:0);
			
			enemie.setVel((Math.floor(Math.random() * 3)+vel[type])*dir, 0);
			enemie.typeEnemie = type;
			
			io.addObj(enemie);
			io.addToGroup('enemie', enemie);
		},
		
		bossAdd : function(io){
			//x, y, width, height
			
			var enemie = new iio.Rect(950, 600, 112,75)
							.enableKinematics()
							.setVel(0, 0)
							.setAcc(0, s.gravity);
			
			enemie.addAnim(s.enemiesGetImage('vader-stand'));
			enemie.addAnim(s.enemiesGetImage('vader-walk'));
			enemie.addAnim(s.enemiesGetImage('vader-attack'));
			enemie.addAnim(s.enemiesGetImage('vader-blink'));
			enemie.hits = 0;
			enemie.runs = 0;
			enemie.blocked = false;
			enemie.forward = true;
			enemie.setAnimKey(0);
			
			enemie.typeEnemie = 'boss';
			//io.setFramerate(3, enemie);
			
			io.addObj(enemie);
			io.addToGroup('boss', enemie);
			s.boss = enemie;
		},
		
		bossAi : function(io){
			if(s.boss.forward){
				if(s.boss.pos.x == 950){
					if(!s.boss.blocked){
						s.boss.setAnimKey(1);
					}
					s.boss.vel.x = -2;
				}else if(s.boss.pos.x <= 930 && s.boss.pos.x > 30){
					if(!s.boss.blocked){
						s.nanicoVader.play();
						s.boss.setAnimKey(2);
					}
					s.boss.vel.x = -5;
				}else if(s.boss.pos.x < 30){
					if(!s.boss.blocked){
						s.boss.setAnimKey(1);
					}
					s.boss.vel.x = 3;
					s.boss.vel.y = -16;
					s.boss.forward = false;
				}
			}else{
				if(s.boss.pos.x > 950){
					if(!s.boss.blocked){
						s.boss.setAnimKey(0);
					}
					s.boss.vel.x = 0;
					s.boss.vel.y = 0;
					s.boss.pos.x = 950;
					s.boss.forward = true;
					s.boss.runs++;
				}else if((s.boss.pos.x > 350 && s.boss.pos.x < 360) || (s.boss.pos.x > 650 && s.boss.pos.x < 660)){
					if(!s.boss.blocked){
						s.boss.setAnimKey(1);
					}
					s.boss.vel.x = 3;
					s.boss.vel.y = -14;
				}
			}
		},
		
		enemiesStage : function(io){
			
			if(s.currentLevel == 3){
				s.bossStage(io);
			}else{
			
				s.enemiesDead = 0;
				
				var 
					i 			= 0,
					ce 			= s.getConfig().enemies,
					totalTypes 	= ce.types.length,
					types 		= ce.types;
				
				setTimeout(function(){
				
					for(i = 1 ; i <= ce.maxIn ; i++){
						s.enemiesAdd(types[Math.floor(Math.random() * totalTypes)], io);
					}
					
					io.setCollisionCallback('enemie', 'plataform', function(enemie, plataform){
						
						if(
								((enemie.top()+enemie.height) <= (plataform.top()+plataform.height)) &&
								(enemie.left()+enemie.width>plataform.left()+50) &&
								(enemie.left()<plataform.width+plataform.left()-50) && 
								(plataform.bounds.top)
						){
							enemie.vel.y = 0;
							enemie.pos.y = (plataform.pos.y - plataform.height/2) - enemie.height/2;
							
							if(enemie.typeEnemie == 'red'){
								enemie.vel.y = -(Math.floor(Math.random() * 3)+10);
							}
							
							if(enemie.typeEnemie == 'blue' || enemie.typeEnemie == 'green'){
								enemie.vel.y = -2;
							}
							
						}else if(enemie.left()<=plataform.left() && plataform.bounds.left){
							enemie.pos.x = plataform.pos.x-enemie.width/2-50;
						}else if(enemie.left()>=(plataform.left()+plataform.width) && plataform.bounds.right){
							enemie.pos.x = (plataform.pos.x+plataform.width/2+50);
						}
					});
					
					
					io.setCollisionCallback('enemie', 'laser', function(enemie, laser){
						
						s.bitEx.play();
						
						enemie.vel.x = 0;
						enemie.vel.y = -10;
						enemie.acc.y = 1;
						enemie.setAnimKey(2);
						enemie.shrink(0.1);
						
						setTimeout(function(){
							enemie.vel.y = 0;
							enemie.acc.y = 0;
							io.cancelFramerate(enemie);
						}, 3000);
						
						io.rmvObj(enemie);
						io.rmvFromGroup(enemie, 'enemie');
						
						laser.vel.x = 0;
						io.rmvObj(laser);
						io.rmvFromGroup(laser, 'laser');
						laser.shrink(0.8);
						
						s.enemiesDead++;
						if((ce.max-ce.maxIn) >= s.enemiesDead){
							s.enemiesAdd(types[Math.floor(Math.random() * totalTypes)], io);
						}else if(ce.max == s.enemiesDead){
							
							s.blockControl = true;
							document.getElementById('topElements').style.display = 'none';
							
							io.rmvAll();
							io.rmvFromGroup();
							io.cancelFramerate();
							
							if(s.currentLevel < s.config.length){
								
								var m = s.addMedal();
								s.currentLevel++;
								s.menu.close(io, 2000, function(){
									io.rmvObj(m);
									s.restartInfo();
								});
								
								io.addObj(m);
							}
						}
					});
					
					s.enemiesXPlay(io);
					
				}, 1500);
			}
		},
				
		enemiesXPlay : function(io){
			io.setCollisionCallback('enemie', 'player', function(enemie, laser){
				if(s.heroHurted){
					s.heroLife--;
					s.heroSetLife();
					
					if(s.heroLife <= 0){
						
						s.blockControl = true;
						document.getElementById('topElements').style.display = 'none';
						
						io.rmvAll();
						io.rmvFromGroup();
						io.cancelFramerate();
						
						var m = s.addGameOver();
						s.menu.close(io, 2000, function(){
							io.rmvObj(m);
							s.menu.removeElements();
							s.restartInfo();
							s.currentLevel = 1;
							s.menu.start(io);
							
						}, true);
						io.addObj(m);
							
						
					}else{
						
						s.hurt.play();
						s.heroHurted = false;
						s.heroHurt();
						
						setTimeout(function(){
							s.heroHurted = true;
						}, 1000);
					}
				}
			});
		},
	
		bossStage : function(io){
			
			setTimeout(function(){
				s.bossAdd(io);
				
				io.setCollisionCallback('boss', 'plataform', function(enemie, plataform){
					
					if(
							((enemie.top()+enemie.height) <= (plataform.top()+plataform.height)) &&
							(enemie.left()+enemie.width>plataform.left()+50) &&
							(enemie.left()<plataform.width+plataform.left()-50) && 
							(plataform.bounds.top)
					){
						enemie.vel.y = 0;
						enemie.pos.y = (plataform.pos.y - plataform.height/2) - enemie.height/2;

					}else if(enemie.left()<=plataform.left() && plataform.bounds.left){
						enemie.pos.x = plataform.pos.x-enemie.width/2-50;
					}else if(enemie.left()>=(plataform.left()+plataform.width) && plataform.bounds.right){
						enemie.pos.x = (plataform.pos.x+plataform.width/2+50);
					}
				});
				
				
				io.setCollisionCallback('boss', 'laser', function(enemie, laser){
					var rnd = (Math.floor(Math.random() * 100));
					if(enemie.animKey == 0){
						enemie.pos.y -= 100;
					}else if(enemie.animKey == 2){
						laser.addAnim(s.heroGetImg('laser-explode'));
						laser.setAnimKey(1);
						io.rmvObj(laser);
						io.rmvFromGroup(laser, 'laser');
						laser.shrink(0.8);
					}else if(rnd>=95){
						laser.vel.x = (laser.vel.x / 2) * -1;
						io.addToGroup('boss', laser);
					}else if(rnd>=70){
						laser.addAnim(s.heroGetImg('laser-explode'));
						laser.setAnimKey(1);
						io.rmvObj(laser);
						io.rmvFromGroup(laser, 'laser');
						laser.shrink(0.8);
					}else{
						if(enemie.animKey != 3){
							enemie.setAnimKey(3);
							enemie.hits++;
							enemie.blocked = true;
							io.rmvObj(laser);
							io.rmvFromGroup(laser, 'laser');
							laser.shrink(0.8);
							if(enemie.hits == s.lifeBoss){
								
								s.blockControl = true;
								document.getElementById('topElements').style.display = 'none';
								
								io.rmvAll();
								io.rmvFromGroup();
								io.cancelFramerate();
								
								var m = s.addMedal();
								s.currentLevel++;
								s.menu.close(io, 2000, function(){
									io.rmvObj(m);
									s.restartInfo();
									s.theEnd(io);
								}, true);
								io.addObj(m);
								
								document.getElementById('sound').pause();
								s.playSoundStage = true;
								
							}else{
								setTimeout(function(){
										enemie.setAnimKey(1);
										enemie.blocked = false;
								},1000);
							}
						}
					}
				});
				
				s.bossXPlay(io);
			}, 1000);
			
		},
		
		bossXPlay : function(io){
			io.setCollisionCallback('boss', 'player', function(enemie, laser){
				if(s.heroHurted){
					s.heroLife--;
					s.heroSetLife();
					
					if(s.heroLife <= 0){
						
						s.blockControl = true;
						document.getElementById('topElements').style.display = 'none';
						
						io.rmvAll();
						io.rmvFromGroup();
						io.cancelFramerate();
						
						var m = s.addGameOver();
						s.menu.close(io, 2000, function(){
							io.rmvObj(m);
							//window.location = '';
							s.menu.removeElements();
							s.restartInfo();
							s.currentLevel = 1;
							s.menu.start(io);
							
						}, true);
						io.addObj(m);
							
						
					}else{
						
						s.heroHurted = false;
						s.heroHurt();
						
						setTimeout(function(){
							s.heroHurted = true;
						}, 1000);
					}
				}
			});
		},
		
		addMedal : function(){
			var types = ['ididit', 'ididitagain', 'imawesome'];
			var m = new iio.Rect(512, 384, 600,600).addImage(s.heroGetImg(types[s.currentLevel-1])[0]);
			
			return m;
		},
		
		addGameOver : function(){
			var m = new iio.Rect(512, 360, 795, 293)
							.addImage(s.heroGetImg('gameover')[0]);
			return m;
		},
		
		restartInfo : function(){
			s.heroLife = 3;
			s.heroHurted = true;
			s.keyCode = 2;
			s.step = 0;
			s.pos = 0;
			s.isFalling = true;
		},
		
		theEnd : function(io){
			
			var end = new iio.Rect(512, 384, 1024,768)
							.addImage(s.heroGetImg('cineend')[0]);
			
			io.addObj(end);
			
			io.addObj(s.menu.elements['d1']);
			io.addObj(s.menu.elements['d2']);
			s.menu.elements['d1'].setPos(512, 200);
			s.menu.elements['d2'].setPos(512, 565);
			s.menu.elements['d1'].setVel(0, -10);
			s.menu.elements['d2'].setVel(0, 10);
			
			io.setFramerate(30, function(){
				if(s.menu.elements['d1'].pos.y < -150){
					
					s.menu.elements['d1'].setVel(0, 0);
					s.menu.elements['d2'].setVel(0, 0);
					
					io.cancelFramerate();
					setTimeout(function(){
						end.addImage(s.heroGetImg('cineend')[1]);
						io.setFramerate(30, function(){
							io.cancelFramerate();
							
							setTimeout(function(){
								io.rmvAll();
								io.rmvFromGroup();
								io.cancelFramerate();
								
								var m = s.addGameOver();
								s.menu.close(io, 2000, function(){
									io.rmvObj(m);
									s.menu.removeElements();
									s.restartInfo();
									s.currentLevel = 1;
									s.menu.start(io);
									
								}, true);
								io.addObj(m);
							}, 4000);
						});
					}, 4000);
					
				}
			});
			
		}
		
	};
	
	s.ini();
	return s;
};