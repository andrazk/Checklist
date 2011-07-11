var module = module || {};

module.projects = function(){
	
	var template = '\
		<h1>Projekti</h1>\
		<ul>\
			{{#projects}}\
				<li class="clearfix">\
					<h3><a href="/project/{{id}}">{{name}}</a></h3>\
					{{#auth}}\
						<div class="projects-controls">\
							<a href="/project/{{id}}">Uredi</a>&nbsp;|&nbsp;\
							<a href="?dialog=project-delete&id={{id}}&name={{name}}">Izbriši</a>\
						</div>\
					{{/auth}}\
					<div class="clear"></div>\
					<p class="projects-lastedit">{{description}}</p>\
				</li>\
			{{/projects}}\
		</ul>\
		<a id="projects-add" class="projects-add" href="?dialog=addproject">Dodaj projekt</a>\
	'; 
	
	var view = {
			path: '',
			auth: core.user.auth(),
			projects: []
	};
	
	return{
		name: 'Projekti',
		klass: 'projects',
		id: '',
		box: core.$('left'),
		frame: {},
		
		init: function(id, options){
			var self = this;
			this.id = id;
			this.box = options.box || this.box;
			self.getProjects(function(){
				self.draw();
			});

		},
		
		destroy: function(){
			view.projects = [];
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
					this.draw();
					return;
				case 'logout':
					view.auth = false;
					this.draw();
					return;
				case 'newProject':
					var self = this;
					self.getProjects(function(){
						self.draw();
					});
					return;
				case 'deleteProject':
					var self = this;
					self.getProjects(function(){
						self.draw();
					});
					return;
			};
		},
		
		/**
		 * Module methods
		 */
		
		getProjects: function(callback){			
			var self = this;
	        Project.all().list(null, function(results){
	        	var i = 0;
	        	view.projects = [];
	        	if(callback && results.length == 0) callback();
	            results.each(function(el){
	            	view.projects[i] = {
            			name: el.name,
            			description: el.description,
            			id: el.id
	            	};
	            	i++;
	            	
	            	if(callback && i==results.length) callback();
	            	
	            });  
	            
	        });
	        
		}
	};
	
}();