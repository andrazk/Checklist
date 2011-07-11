var module = module || {};

module.project = function(){
	
	var template = '\
		<h1>{{name}}</h1>\
		<a href="/projects">Nazaj</a><br/><br/>\
		<ul class="tasks">\
			{{#tasks}}\
				<li class="task {{state}}">\
					<label class="{{checked}}" for="{{id}}">\
						<input  onclick="core.history.push(\'?action=task-{{action}}&tid={{id}}&index={{index}}\');" {{state}}  type="checkbox" id="{{id}}"/>\
						{{label}}\
					</label>\
					<div class="task-status-bar">\
						Komentarjev: {{commentsLength}}&nbsp;|&nbsp;\
						<a href="?action=get-comments&tid={{id}}&index={{index}}">Dodaj komentar</a>&nbsp;|&nbsp;\
						<a href="?action=task-delete&tid={{id}}&index={{index}}">Izbriši</a>\
					</div>\
					\
					<ul class="comments">\
						{{#comments}}\
							<li class="comment">\
								<p><b>{{username}}</b> {{text}}</p>\
								<span class="date">{{date}}</span>\
							</li>\
						{{/comments}}\
						{{#commentForm}}\
							<li class="comment-form clearfix">\
								<form id="comment-form-{{id}}" action="?action=add-comment&">\
									<textarea name="comment"></textarea>\
									<input type="hidden" name="tid" value="{{id}}" />\
									<input type="hidden" name="index" value="{{index}}" />\
									<input type="submit" value="Pošlji" />\
								</form>\
							</li>\
						{{/commentForm}}\
					</ul>\
				</li>\
			{{/tasks}}\
			{{^tasks}}\
				<li>Ni opravil.</li>\
			{{/tasks}}\
		</ul>\
		<a href="?dialog=add-task&pid={{pid}}">Dodaj opravilo</a>\
		&nbsp;|&nbsp;<a href="/projects">Nazaj</a>\
	'; 
	
	var view = {
			path: 'Checklist',
			auth: core.user.auth(),
			name: '',
			pid: 0,
			tasks: []
	};
	
	return{
		name: 'Projekt',
		klass: 'project',
		id: '',
		box: core.$('left'),
		frame: {},
		project: {},
		
		init: function(id, options){
			console.log('Inicializiral se bom!!!');
			var self = this;
			this.id = id;
			this.box = options.box || this.box;
			//Clear view
			//if(view.pid != core.history.get[1])
			view.tasks = [];
			
			self.getProject();
			self.getTasks(function(){
				self.draw();
			});

		},
		
		draw: function(callback){			
			var self = this;
			console.log('View', view);
			core.dom.render(template, view, function(html){				
				self.frame.innerHTML = html;
				if(callback) callback();
			});
		},
		
		notify: function(type, data){
			var self = this;
			switch(type){
				case 'login':
					view.auth = true;
					this.draw();
					return;
				case 'logout':
					view.auth = false;
					this.draw();
					return;
				case 'refresh':
					var self = this;
					if(data.params.action)
						this.action(data);
					return;
				case 'newTask':
					var l = view.tasks.length;
					view.tasks[l] = {
						label: data.label,
	            		state: data.state ? 'checked' : 'unchecked',
	    				action: data.state ? 'uncheck' : 'check',
		            	id: data.id,
		            	index: l,
		            	commentsLength: 0
					};
					this.draw();
					return;
				case 'deleteTask':
					self.getTasks(function(){
						self.draw();
					});
					//TODO: Namesto poizvedb u bazo spremeni View
					/**
					//Find task in View
					var l = view.tasks.length;
					for(var i=0; i < l; i++){
						//console.log('Dobro ki je zdejofdsfčo', view.tasks[i].id, data.id);
						if(view.tasks[i].id == data.id){
							console.log('Task ID', view.tasks[i]);
							view.tasks[i] = null;
							//Remove from View Tasks
							core.misc.reflow(view.tasks, function(result){
								view.tasks = result;							
								console.log('After Task Delete', view);
								self.draw();
							});
							return;
						}
					}
					*/
					return;
				case 'newComment':
					for(var i = 0; i < view.tasks.length; i++){
						if(view.tasks[i].id == data.tid){
							self.getComments(i, function(){					
								self.draw();
							});
							return;
						}
					}
					return;
				case 'checkTask':
					self.getTasks(function(){
						self.draw();
					});
					return
				case 'uncheckTask':
					self.getTasks(function(){
						self.draw();
					});
					return
			};
		},
		
		/**
		 * Module methods
		 */
		action: function(url){
			var self = this;
			var _p = url.params;
			switch(_p.action){
			case 'task-check':
				Task.load(_p.tid, function(entity){
					entity.state = 1;
					persistence.add(entity).flush(function(){
						core.notify('checkTask', entity);
						logObject = {
							action: 'check'
						};
						core.db.saveLogS(entity, logObject);
					});
				});
				core.history.replace(core.history.last);
				return;
			case 'task-uncheck':
				Task.load(_p.tid, function(entity){
					entity.state = 0;
					persistence.add(entity).flush(function(){
						core.notify('uncheckTask', entity);
						logObject = {
							action: 'uncheck'
						};
						core.db.saveLogS(entity, logObject);
					});
				});
				core.history.replace(core.history.last);
				return;
			case 'task-delete':
				core.db.deleteTask(_p.tid, function(err, task){
					
				});
				return;
			case 'get-comments':
				self.getComments(_p.index, function(){					
					view.tasks[_p.index].commentForm = true;
					console.log('Dodaj Komentar', view.tasks[_p.index]);
					self.draw();
				});
				return;
			case 'add-comment':
				var text = core.url.decode(_p.comment);
				if(!text) return;
				_c = {
					tid: _p.tid,
					text: core.url.decode(_p.comment),
					username: core.user.username,
					date: new Date()
				};
				core.db.saveComment(_c, function(entity){
					core.history.replace(core.history.last);
					core.notify('newComment', entity);					
					//TODO: Namesto poizvedb u bazo spremeni View
					/**
					view.tasks[_p.index].comments = view.tasks[_p.index].comments || {};
					var l = view.tasks[_p.index].comments.length;
					view.tasks[_p.index].comments[l] = {
						text: entity.text,
						username: entity.username,
						date: entity.date.format('d.m.yyyy HH:MM')
					};
					self.draw();
					*/
				});
				return;
			};
		},
		
		getTasks: function(callback){
			//console.log('getTasks');
			var self = this;
			
			var pid = core.history.get[1];
	        Task.all().filter('pid', '=', pid).list(null, function(results){
	        	var i = 0;
	        	if(results.length == 0){
	        		console.log('prazno');
	        		if(callback) callback();
	        		return;
	        	}
	        	view.tasks = [];
	            results.each(function(el){
	            	view.tasks[i] = view.tasks[i] || {};
            		view.tasks[i].label = el.label;
            		view.tasks[i].state = el.state ? 'checked' : 'unchecked';
    				view.tasks[i].action = el.state ? 'uncheck' : 'check';
	            	view.tasks[i].id = el.id;
	            	view.tasks[i].index = i;
	            	view.tasks[i].commentsLength = 0;
	            	
	            	var countComments = function(index){
		            	Comment.all().filter('tid', '=', view.tasks[index].id).count(function(l){
		            		view.tasks[index].commentsLength = l;
		            		self.draw();
		            	});
	            	}(i);
	            	
	            	i++;
	
	            	if(callback && i==results.length) callback();
	            	
	            });  
	            
	        });	        
		},
		
		getProject: function(callback){
			var self = this;
			//Not updated
			var pid = core.history.get[1];
			Project.load(pid, function(project){
				if(callback) callback();
				view.name = project.name;
				view.pid = project.id;
			});
		}, 
		
		getComments : function(index, callback){
			console.log('getComments', view);
			Comment.all().filter('tid', '=', view.tasks[index].id).list(null, function(results){
				//No comments -> callback
				if(results.length == 0 && callback){
					callback();
					return false;
				}
				//Else
				var i = 0;
				view.tasks[index].commentsLength = results.length;
				view.tasks[index].comments = [];
				
				//Find user name
				var getFullname = function(username, index, i){
					console.log('jigfgnfgijginjfg'+username);
					core.user.getFullname(username, function(err, name){
						view.tasks[index].comments[i] = name;
						console.log('Ime mi je ' + name);
					});
					return username;
				};
				
				results.each(function(el){
					view.tasks[index].comments[i] = {
						text: el.text,
						username: getFullname(el.username, index, i),//el.username,
						date: core.date.dateFormat(el.date, 'd.m.yyyy HH:MM')		
					};
					

					
					if(/*i == results.length &&*/ callback) callback();
					i++;
				});
			});
		}
		
		
	};
	
}();