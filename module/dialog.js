var module = module || {};
module.dialog = function(){
	var dialog = {};
	dialog.login = {};
		dialog.login.creator = {
			title: 'Login form',
			content: '<label for="username-input">Uporabniško ime:</label><input id="username-input" type="text" name="username"/>',
			buttons: [
		          {
		        	  title: 'Potrdi',
		        	  color: 'blue',
		        	  event: function(){
		        		  var self = this;
		        		  core.user.login(core.$('username-input').value, '', function(msg){
		        			  self.close();
		        			  
		        		  });
		        	  }
		          },
		          {
		        	  title: 'Zapri',
		        	  event: function(){
		        		  this.close();
		        	  }
		          }
	          ]
		};
	
	return {
		name: 'dialog',
		box: '',
		dialog: {},
		
		init: function(options){
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
			}
		},
		
		stancer: function(type){
			if(!dialog[type].instance)
				return dialog[type].instance = new LightFace(dialog[type].creator);
			else return dialog[type].instance;
		}

	};
	

}();