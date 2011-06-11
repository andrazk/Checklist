var module = module || {};

module.log = function(){
	
	var template = '\
		{{#logs}}\
			<a href="{{link}}" class="notification {{klass}}">\
				<div class="msg">\
					{{prefix}} <b>{{item}}</b> {{suffix}}.\
				</div>\
				{{#user}}\
					<span class="user">{{user}}</span>\
				{{/user}}\
				<span class="date">{{date}}</span>\
			</a>\
		{{/logs}}\
	'; 
	
	var view = {
		logs: []
		/**
		{
			item: 'Projekt 3',
			suffix: 'dodan',
			prefix: '',
			link: 'projects/939393939',
			klass: 'project',
			user: 'Andraž Krašček',
			date: '28.5.2011 11:32'
		}
		 */
	};
	
	return{
		name: 'Obvestila',
		klass: 'log',
		id: '',
		box: core.$('right'),
		frame: {},
		
		init: function(id, options){
			var self = this;
			this.id = id;
			this.box = options.box || this.box;
			self.getLast(10, function(err){
				self.draw();
				console.log('Log Module', view);
			});
		},
		
		draw: function(localView){			
			var self = this;
			var _v = localView || view;
			core.dom.render(template, _v, function(html){
				var tmp = self.frame.innerHTML;
				self.frame.innerHTML = html+tmp;
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
		},
		
		/**
		 * Module methods
		 */
		
		/**
		 * Prepare notification before showing.
		 * @param log
		 * @param cb
		 */
		prepare: function(log, cb){
			core.sync.loadEntity(log, function(err, entity){
				if(err) return console.log('Napaka!!!', 'module.log.prepare()', err);
				
				var obj = {};
				switch(log.type){
					case 'Project': 
						obj = {
							item: entity.name,
							suffix: log.action == 'new' ? 'dodan' : 'izbrisan',
							prefix: '',
							link: 'project/' + log.iid,
							klass: 'project' + log.action,
							user: log.user,
							date: core.date.format(log.date)
						};
						return cb(null, obj);
					case 'Task': 
						var suffixer = function(a){
							if('new') return 'dodano';
							if('delete') return 'izbrisano';
							if('check') return 'opravljeno';
							if('uncheck') return 'razveljavljeno';
						};
						
						obj = {
							item: entity.label.slice(0, 20) + '...',
							suffix: suffixer(entity.action),
							prefix: 'Opravilo',
							link: 'project/' + entity.pid,
							klass: 'task ' + log.action,
							user: log.user,
							date: core.date.format(log.date)
						};
						return cb(null, obj);
					case 'Comment':
						Task.load(entity.tid, function(task){
							obj = {
								item: entity.text.slice(0, 20) + '...',
								suffix: 'dodan',
								prefix: 'Komentar',
								link: 'project/' + task.pid + '?action=get-comments&tid=' + task.id,
								klass: 'comment' + log.action,
								user: log.user,
								date: core.date.format(log.date)
							};
							return cb(null, obj);
						});					

						break;
				}
			});
		},
		
		/**
		 * Finds last i logs.
		 * @param i number of hits.
		 * @param cb 
		 */
		getLast: function(i, cb){
			var self = this;
			Log.all().order('date', false).limit(i).list(function(results){
				results.each(function(log){
					var l = view.logs.length;
					self.prepare(log, function(err, obj){
						view.logs[l] = obj;
						cb(null);
					});
				});
			});
		}

	};
	
}();