var module = module || {};
module.statusBar = function(){
	
	return {
		name: 'status-bar',
		box: $$('body'),
		frame: new Element('div', {id: this.name}),
		
		init: function(options){
			box = options.box || box;
			this.draw();
			
		},
		
		draw: function(){
			var html = '<h1>Checklist</h1>';
			if(core.user.auth()){
				html += 'Pozdravljen ' + core.user.username;
				html += '<a href="?action=logout">odjava</a>';
			}else{
				html += '<a href="?dialog=login" rel="dialog">Prijava</a><a href="register" rel="dialog">Registracija</a>';
			}
			box.innerHTML = html;
		},
		
		notify: function(type, data){
			switch(type){
				case 'login':
					this.draw();
					return;
				case 'logout':
					this.draw();
					return;
			};
		}
	};
}();