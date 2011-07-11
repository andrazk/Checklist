var core = core || {};
core.user = function(){
	return {
		//ATRIBUTES
		username: localStorage.getItem('username'),
		name: localStorage.getItem('name'),
		surname: localStorage.getItem('surname'),
		
		//METHODS
		login: function(username, password, cb){
			var self = this;
			core.xhr.open('get', 'http://checklist.no.de/user/login/'+username+'/'+password, true);
			core.xhr.send();
			core.xhr.onload = function(e){
				if(core.xhr.status == 200){
					user = JSON.decode(core.xhr.responseText);

					localStorage.setItem('username', user.username);
					self.username = user.username;
					localStorage.setItem('name', user.name);
					self.name = user.name;
					localStorage.setItem('surname', user.surname);
					self.surname = user.surname;
					if(cb) cb(null, user);
				}else{
					if(cb) cb('Error!!! Try Again.');
				}
			};
			
			core.xhr.onerror = function(e){
				console.log('User Login Error', core.xhr, e);
			};
		},
		
		logout: function(){
			var self = this;
			localStorage.removeItem('username');
			localStorage.removeItem('name');
			localStorage.removeItem('surname');
			self.username = '';
			self.name = '';
			self.surname = '';
			core.notify('logout');
		},
		
		auth: function(){
			var username = localStorage.getItem('username');
			if(username) return username;
			return false;
		},
		
		/**
		 * Register New User
		 * @param user User object
		 * @param cb 
		 * @param log Save entry to log?
		 */
		register: function(user, cb, log){
			log = log || true;
			
			//Save to MySQL
			core.xhr.open('get', 'http://checklist.no.de/user/register/'+user.username+'/'+user.password+'/'+user.name+'/'+user.surname, true);
			//core.xhr.setRequestHeader('Content-Type', 'application/json');
			core.xhr.send();
			core.xhr.onload = function(){
				if(core.xhr.status == 200){
					data = JSON.decode(core.xhr.responseText);
					
					//ERROR
					if(data.error && cb) return cb(data.error);
					var user = {
						username: data.iid.username,
						name: data.iid.name,
						surname: data.iid.surname
					};
					if(cb) cb(null, user);
				}
			};
			
			core.xhr.onerror = function(e){
				console.log('User Register Error', core.xhr, e);
			};

		},
		
		/**
		 * getUser
		 */
		getUser: function(username, cb){
			User.all().filter('username', '=', username).one(function(el){
				if(el == null) cb('Doesnt, exists', null); return;
				cb(null, el);
			});
		},
		
		getFullname: function(username, cb){
			this.getUser(username, function(err, user){
				if(err) cb(err, username);
				cb(null, user.name + ' ' + user.surname);
			});			
		}
	};
}();