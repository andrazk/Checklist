var module = module || {};
module.statusBar = function(){
	var view = {
		auth: core.user.auth(),
		name: core.user.name + ' ' + core.user.surname,
		lastSync: ''
	};
	
	var template = '\
		<ul class="clearfix">\
		{{#auth}}\
			<li><span>{{name}}</span></li>\
			<li><a href="?action=logout">Odjava</a></li>\
			<li><a href="?action=sync">Sinhroniziraj</a></li>\
		{{/auth}}\
		{{^auth}}\
			<li><a href="?dialog=login">Prijava</a></li>\
			<li><a href="?dialog=register">Registracija</a></li>\
		{{/auth}}\
		</ul>\
		{{#auth}}\
			<p class="last-sync">Zadnja sinhronizacija: {{lastSync}}</p>\
		{{/auth}}\
	';
	
	return {
		name: 'statusbar',
		id: '',
		box: core.$$('header')[0],
		frame: {},
		
		init: function(id, options){
			var self = this;
			this.id = id;
			this.box = options.box || this.box;
			self.draw();	
		},
		
		draw: function(){
			var self = this;
			core.dom.render(template, view, function(html){
				self.frame.innerHTML = html;
			});
		},
		
		notify: function(type, data){
			switch(type){
				case 'login':
					view.auth = true;
					view.name = data.name;
					this.draw();
					return;
				case 'logout':
					view.auth = false;
					this.draw();
					return;
			};
		}
	};
}();