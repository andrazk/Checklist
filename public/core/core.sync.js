var core = core || {};

core.sync = function(){
	return {
		/**
		 * Create entity
		 * @param log
		 * @param obj
		 * @param cb
		 */
		createEntity: function(log, obj, cb){
			var entity;
			switch(log.type){
				case 'Project':
					entity = new Project({
				  	    name:obj.name,
				  	    description: obj.description || ''
					});					
					break;
				case 'Task':
					entity = new Task({
				    	pid: obj.pid,
				    	label: obj.label,
				    	state: obj.state
					});
					break;
				case 'Comment':
					entity = new Comment({
				    	tid: obj.tid,
				    	text: obj.text,
				    	username: obj.username,
				    	date: Date.parse(obj.date)
					});
					break;
				case 'User':
					entity = new User({
				    	username: obj.username,
				    	name: obj.name,
				    	surname: obj.surname
					});
					break;
			}
			entity.id = log.iid || obj.id;
			
			if(cb) cb(null, entity);
		},
		
		loadEntity: function(log, cb){
			cb = cb || {};
			if(!log.iid) return cb('ID mising.', null);
			if(log.action == 'delete') return cb('Ma si mona', null);
			var entity;
			switch(log.type){
				case 'Project':
					Project.load(log.iid, function(e){
						if(e == null){if(cb) cb(true); return;}
						if(cb) cb(null, e);
					});				
					break;
				case 'Task':
					Task.load(log.iid, function(e){
						if(e == null){if(cb) cb(true); return;}
						if(cb) cb(null, e);
					});	
					break;
				case 'Comment':
					Comment.load(log.iid, function(e){
						if(e == null){if(cb) cb(true); return;}
						if(cb) cb(null, e);
					});	
					break;
			}
		},
		
		/**
		 * Check if newer log exists
		 * @param log
		 * @param cb paramater err true if log exists
		 */
		newerLog: function(log, cb){
			if(log.iid.id) log.iid = log.iid.id;
			Log.all().filter('iid', '=', log.iid).order('date', false).one(function(log){
				if(log == null){
					if(cb) cb(true);
					return;
				}else{
					if(cb) cb(null, log);
				}
			});
		},
		
		one: function(slog, sentity){
			var self = this;
			if(!slog.iid) return console.log('sLog nima IID');
			self.newerLog(slog, function(err, nlog){
				nlog = nlog || {};
				nlog.date = new Date(nlog.date) || 0;
				if(nlog && nlog.date > slog.date) return;
				
				self.createEntity(slog, sentity, function(err, entity){
					logObject = {
						date: Date.parse(slog.date),
						id: slog.lid,
						user: slog.user
					};
					console.log('Core Sync One', entity);
					switch(slog.action){
						case 'delete':
							logObject.action = 'delete';
							persistence.remove(entity);
							break;
						case 'check':
							Task.load(slog.iid, function(entity){
								entity.state = 1;
								persistence.add(entity);
								persistence.flush(function(){					
									core.db.saveLogS(entity, logObject, null, false);
								});
							});
							break;
						case 'uncheck':
							Task.load(slog.iid, function(entity){
								entity.state = 0;
								persistence.add(entity);
								persistence.flush(function(){					
									core.db.saveLogS(entity, logObject, null, false);
								});
							});
							break;
						default: //action = new
							//Save entity		
							persistence.add(entity);
							break;
					}
					persistence.flush(function(){					
						core.db.saveLogS(entity, logObject, null, false);
					});
					//NOTIFY
					core.notify(slog.action+slog.type, entity);
				});
			});
		},
		
		syncLocalSide: function(){
			var self = this;
			Log.all().filter('sid', '=', '0').order('date', false).list(function(results){
            	results.each(function(log){
            		self.loadEntity(log, function(err, entity){
                		console.log('Sync Local Side', log, entity, err);
                		core.socket.send({log: log, obj: entity});
            		});    				
            	});
			});
		},
		
		sync: function(){
			var lastSync = localStorage.getItem('lastSync') || '0';			
			core.socket.send({lastSync: lastSync});
			this.syncLocalSide();
			localStorage.setItem('lastSync', new Date());
			//TODO: Uredi check in uncheck sync.
		}
	};
}();