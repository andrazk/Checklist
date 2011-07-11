var module = module || {};

module.welcome = function(){
	
	var template = '\
		<h1>HTML5 Checklist - prikaz uporabe HTML5 JavaScript vmesnikov.</h1>\
		<p>Pozdravljeni! <br/><br/>Sem Andraž Krašček, študent Multimedijskih komunikacij FE UNI LJ.<br/>Dotična spletna aplikacija je del diplomskega dela v katerem želim predstaviti uporabo JavaScript aplikacijskih programskih vmesnikov (API). <br/><br/>Vmesniki uporabljeni v aplikaciji:\
			<ul id="apis">\
				<li id="websqldatabase">WebSQL DB</li>\
				<li id="webworkers">WebWorkers</li>\
				<li id="localstorage">LocalStorage</li>\
				<li id="websockets">WebSocket</li>\
				<li id="history">History API</li>\
				<li id="applicationcache">Offline</li>\
			</ul>\
			<br/>\
			<p>Priporočam uporabo brskalnika <a class="follow" href="http://www.google.com/chrome">Google Chrome</a> ali <a class="follow" href="http://www.apple.com/safari/">Apple Safari</a>.</p>\
			<br/>\
			{{#auth}}\
				<a href="projects">Pričnite uporabljati aplikacijo...</a>\
			{{/auth}}\
			{{^auth}}\
				Za uporabo aplikacije se <a href="?dialog=login">prijavite</a> ali <a href="?dialog=register">registrirajte</a>.\
			{{/auth}}\
		</p>\
	'; 
	
	var view = {
		auth: core.user.auth()
	};
	
	return{
		name: 'Pozdravni modul',
		klass: 'welcome',
		id: '',
		box: core.$('center'),
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
					view.name = core.user.username;
					this.draw();
					return;
				case 'logout':
					view.auth = false;
					this.draw();
					return;
			};
		}
		
		/**
		 * Module methods
		 */
		

	};
	
}();