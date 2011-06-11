var module = module || {};
module.dialog = function(){
	var dialog = {};
	dialog.login = {};
	dialog.login.creator = {
		title: 'Login form',
		content: '\
			<label for="username-input">Uporabniško ime:</label><input id="username-input" type="text" name="username"/><br/>\
			<label for="password-input">Geslo:</label><input id="password-input" type="text" name="password"/>',
		buttons: [
	          {
	        	  title: 'Potrdi',
	        	  color: 'blue',
	        	  event: function(){
	        		  var self = this;
	        		  var check = function(msg){
	        			  new LightFace({
	        				  title: 'Napaka',
	        				  content: msg,
	        				  buttons: [{title: 'Zapri', event: function(){this.close();}}]
	        			  }).open();
	        		  };
	        		  //Check username
	        		  username = core.$('username-input').value;
	        		  if(!username) return check('Vnesi uporabniško ime');
	        		  //Check password
	        		  password = core.$('password-input').value;
	        		  if(!password) return check('Vnesi geslo');
	        		  core.user.login(username, password, function(err, user){
	        			  if(err){
	        				  return check(err);
	        			  }
	        			  core.notify('login', user);
	        			  self.close();
	        			  core.history.replace(core.history.last);
	        		  });
	        	  }
	          },
	          {
	        	  title: 'Zapri',
	        	  event: function(){
	        		  this.close();
	        		  core.history.replace(core.history.last);
	        	  }
	          }
          ]
	};
	dialog.register = {};
	dialog.register.creator = {
		title: 'Register form',
		content: '\
			<div><label for="username-input">Email:</label><input id="username-input" type="email" name="username"/></div>\
			<div><label for="name-input">Ime:</label><input id="name-input" type="text" name="name"/></div>\
			<div><label for="surname-input">Priimek:</label><input id="surname-input" type="text" name="surname"/></div>\
			<div><label for="password-input">Geslo:</label><input id="password-input" type="text" name="password"/></div>\
			',
		buttons: [
	          {
	        	  title: 'Potrdi',
	        	  color: 'blue',
	        	  event: function(){
	        		  var self = this;
	        		  //Define check dialog
	        		  var check = function(msg){
	        			  return new LightFace({
	        				  title: 'Napaka',
	        				  content: msg,
	        				  buttons: [{title: 'Zapri', event: function(){this.close();}}]
	        			  }).open();
	        		  };
	        		  //Check Username
	        		  username = core.$('username-input').value;
	        		  if(!username) return check('Vnesi email naslov');
	        		  //Check passWord
	        		  password = core.$('password-input').value;
	        		  if(!password) return check('Vnesi geslo.');
	        		  //Check name
	        		  name = core.$('name-input').value;
	        		  if(!name) return check('Vnesi ime.');
	        		  //Define User Object
	        		  var user = {
	        				  username: username,
	        				  name: name,
	        				  surname: core.$('surname-input').value,
	        				  password: password
	        		  };
	        		  //Start Register Process
	        		  core.user.register(user, function(err, entity){
	        			  //Error
	        			  if(err) return check(err);
	        			  //Notify
	        			  core.notify('newuser', entity);
	        			  var loginDialog = check('Registracija uspela. Poteka prijava...');
	        			  
	        			  //PRIJAVA
	        			  core.user.login(user.username, user.password, function(err, user){
	        				  if(err) return check(err);
	        				  
	        				  self.close();
	        				  if(loginDialog.close) loginDialog.close();
	        				  core.notify('login', user);
	        				  core.history.replace(core.history.last);
	        			  });
	        		  });
	        	  }
	          },
	          {
	        	  title: 'Zapri',
	        	  event: function(){
	        		  this.close();
	        		  core.history.replace(core.history.last);
	        	  }
	          }
          ]
	};
	dialog.addproject = {};
	dialog.addproject.creator = {
			title: 'Dodaj nov projekt',
			content: '<label for="projectname-input">Ime projekta:</label><input id="projectname-input" type="text" name="username"/>',
			buttons: [
		          {
		        	  title: 'Potrdi',
		        	  color: 'blue',
		        	  event: function(){
		        		  var self = this;
		        		  var _p = {name: core.$('projectname-input').value};
		        		  core.db.saveProject(_p, function(entity){
		        			  core.notify('newProject', _p);
	                    	  self.close();
	                    	  core.$('projectname-input').set('value', '');
	                    	  core.db.addTmpTasks(entity, function(entity){	                    		  
		                    	 
	                    	  });
	                    	  core.history.replace('project/' + entity.id);
		        		  });
		        	  }
		          },
		          {
		        	  title: 'Zapri',
		        	  event: function(){
		        		  this.close();
		        		  core.history.replace(core.history.last);
		        	  }
		          }
	          ]
		};
	
	dialog.projectdelete = {};
	dialog.projectdelete.creator = {
			title: 'Izbriši projekt',
			content: 'Ali ste prepričani da želite izbrisati projekt',					
			buttons: [
		          {
		        	  title: 'Potrdi',
		        	  color: 'blue',
		        	  event: function(){
		        		  var self = this;
		        		  core.db.deleteProject(core.history.params.id, function(err, project){
		        			  self.close();
		        			  core.history.replace(core.history.last);
		        		  });
		        	  }
		          },
		          {
		        	  title: 'Zapri',
		        	  event: function(){
		        		  this.close();
		        		  core.history.replace(core.history.last);
		        	  }
		          }
	          ]
		};
	
	dialog.addTask = {};
	dialog.addTask.creator = {
			title: 'Dodaj novo opravilo',
			content: '<label for="taskname-input">Ime opravila:</label><br/><textarea style="width:350px; heigth:80px;" id="taskname-input" name="task"></textarea>',
			buttons: [
		          {
		        	  title: 'Potrdi',
		        	  color: 'blue',
		        	  event: function(){
		        		  var self = this;
		        		  var task = {
	        				  label: core.$('taskname-input').value,
	        				  pid: core.history.get[1],
	        				  state: false
        				  };
		        		  
		        		  core.db.saveTask(task, function(entity){
		        			  core.notify('newTask', entity);
		        			  core.$('taskname-input').value = '';
	                    	  self.close();
	                    	  core.history.replace(core.history.last);
		        		  });
		        	  }
		          },
		          {
		        	  title: 'Zapri',
		        	  event: function(){
		        		  this.close();
		        		  core.history.replace(core.history.last);
		        	  }
		          }
	          ]
		};
	
	return {
		name: 'dialog',
		id: '',
		box: core.$('main'),
		dialog: {},
		
		init: function(id, options){
			//DIALOGS
		},
		
		notify: function(type, data){
			switch(type){
				case 'refresh':
					if(data.params.dialog) this.selectDialog(data.params.dialog);
					return;
			};
		},
		
		selectDialog: function(type){
			switch(type){
				case 'login':
					this.stancer(type).open();
					return;
				case 'register':
					this.stancer(type).open();
					return;
				case 'addproject':
					this.stancer(type).open();
					return;
				case 'project-delete':
					var self = this;
					Project.load(core.history.params.id, function(_p){
						var name = _p.name || 'projekt';
						dialog['projectdelete'].creator.content = 'Ali želite izbrisati projekt <b>' + name + '</b>';
						self.stancer('projectdelete').open();
					});
					return;
				case 'add-task':
					this.stancer('addTask').open();
					return;
			}
		},
		
		stancer: function(type){
			if(!dialog[type].instance)
				return dialog[type].instance = new LightFace(dialog[type].creator);
			else return dialog[type].instance;
		}

	};
	

}();