var core = core || {};

core.db = function(){
	
	return{
		saveProject: function(project, cb, tmpLog){
			var self = this;
			log = (tmpLog == null) ? true : tmpLog;
			var _p = new Project(project);
  		  	persistence.add(_p);
            persistence.flush(function(){
            	if(cb) cb(_p);
            	if(log){
      			  self.saveLogS(_p);
            	}
            });
		},
		
		/**
		 * Checks if log already exists
		 * @param sid Logs server id
		 * @param cb Callback
		 */
		checkSID: function(sid, cb){
			Log.findBy('sid', sid, function(entity){
				if(entity) return;
				if(cb) cb();				
			});
		},
		
		/**
		 * Save new entry to Log
		 * @param entity Database entity
		 * @param action What happened
		 * @param success Callback function on success
		 */
		saveLog: function(entity, action, success){
			var _a = action ? action : 'new';
			var log = new Log({
                sid: '0',
                iid: entity,
                type: entity._type,
                action: _a,
                date: new Date(),
                user: core.user.username
            });
            persistence.add(log);
            persistence.flush(function(){
                if(success) success(log);
            });
		},
		
		/**
		 * Save new entry to Log, allows more customization with logObject param.
		 * @param entity Database entity
		 * @param logObject What happened
		 * @param success Callback function on success
		 * @param sync Synchronyz with server?
		 */
		saveLogS: function(entity, logObject, cb, tmpSync){
			//Check User Auth
			var username =  core.user.auth();
			if(!username) return;
			console.log('Entity', entity);
			//Define parameters
			sync = (tmpSync == null) ? true : tmpSync;
			logObject = logObject || {};
			//Define Log Entity
			var log = new Log({
                sid: logObject.sid || '0',
                iid: logObject.iid ? logObject.iid : entity.id,
                type: logObject.type ? logObject.type : entity._type,
                action: logObject.action || 'new',
                date: logObject.date ? logObject.date : new Date(),
                user: logObject.user || username
            });
			if(logObject.id) log.id = logObject.id;
			//Save
            persistence.add(log);
            setTimeout(persistence.flush(function(){
                if(cb) cb(log);
                //Sync
                //console.log('Sync Status', sync);
                if(sync){
                	core.socket.send({log: log, obj: entity});
                	//console.log('Sync', log);
                }
            }), 100);
		},
		
		/**
		 * Add default template tasks to new project
		 * @param entity Project entity
		 * @param cb Callback
		 */
		addTmpTasks: function(entity, cb){
			var self = this;
			var templateTask = [
            	{label: 'Favicon has been created and displays correctly?'},
            	{label: 'JavaScript is error free?'},
            	{label: '404 page exists and informative?'}
            ];
			var _t;
			templateTask.each(function(el){
				el.pid = entity.id;
				self.saveTask(el);
				/**
				el.pid = entity.id;
				_t = new Task(el);
				persistence.add(_t);
				*/
			});
			/**
			persistence.flush(function(){
				if(cb) callback(cb);
			});
			*/
		},
		
		/**
		 * Saves Comment to DB
		 * @param data Comment object
		 * @param callback calback function
		 * @param log Saves entry to Log?
		 */
		saveComment: function(comment, cb, tmpLog){
			var self = this;
			log = (tmpLog == null) ? true : tmpLog;
			
			var _c = new Comment(comment);
			persistence.add(_c);
			persistence.flush(function(){
				if(log) self.saveLogS(_c);
				if(cb) cb(_c);
			});
		},
		
		/**
		 * Saves new task to DB
		 * @param task Task object
		 * @param cb Callback function, entity as parameter
		 * @param log Saves entry to Log?
		 */
		saveTask: function(task, cb, tmpLog){
			var self = this;			
			log = (tmpLog == null) ? true : tmpLog;

			var _t = new Task(task);
			persistence.add(_t);
			persistence.flush(function(){
				if(log) self.saveLogS(_t);
				if(cb) cb(_t);
			});
		},
		
		deleter: function(entity, cb, tmpLog){
			var self = this;
			log = (tmpLog == null) ? true : tmpLog;
			
			persistence.remove(entity);
			persistence.flush(function(){
				if(cb) cb(null, entity);
				core.notify('delete'+entity._type, entity);
				if(log){
					logObject = {
							action: 'delete'
					};
					self.saveLogS(entity, logObject);
				}
			});
		},
		
		deleteProject: function(id, cb, tmpLog){
			var self = this;			
			log = (tmpLog == null) ? true : tmpLog;
			
  		  	Project.load(id, function(entity){
			//Delete project
	  		self.deleter(entity, function(err, project){
	  			if(cb) cb(null, project);
	  			//Delete Tasks
				Task.all().filter('pid', '=', project.id).list(function(tasks){
					console.log('Delete Tasks', tasks);
					//if(tasks.length == 0) return;
					tasks.each(function(task){
						self.deleter(task, function(err, task){
							//Delete Comments
							Comment.all().filter('tid', '=', task.id).list(function(comments){
								//if(comments.length == 0) return;
								comments.each(function(comment){
									self.deleter(comment, function(err, comment){
										  
									});
								});
							});
						});
					});
				});
	  		});

		  });
		},
		
		deleteTask: function(id, cb, tmpLog){
			var self = this;			
			log = (tmpLog == null) ? true : tmpLog;
			
			Task.load(id, function(task){
				//if(!entity && cb) return cb('Task doesnt exists'); 
				self.deleter(task, function(err, task){
					if(cb) cb (null, task);
					//Delete Comments
					Comment.all().filter('tid', '=', task.id).list(function(comments){
						//if(comments.length == 0) return;
						comments.each(function(comment){
							self.deleter(comment, function(err, comment){
								  
							});
						});
					});
				});
			});
			
		},
		
		/**
		 * Delete comment from DB
		 * @param id Comment id
		 * @param cb Callback function
		 * @param log Save to Log?
		 */
		deleteComment: function(id, cb, tmpLog){
			var self = this;			
			log = (tmpLog == null) ? true : tmpLog;

			Comment.load(id, function(entity){
				if(!entity && cb) return cb('Comment doesnt exists'); 
				self.deleter(entity, cb);
			});
		},
		
		saveUser: function(user, cb, tmpLog){
			var self = this;			
			log = (tmpLog == null) ? true : tmpLog;

			var _u = new User(user);
			persistence.add(_u);
			persistence.flush(function(){
				if(log){
					self.saveLogS(_u, {
						sid: data.id,
						date: data.date,
						user: data.user
					}, null, false);
				}
				if(cb) cb(null, _u);
			});
		}
	};
}();