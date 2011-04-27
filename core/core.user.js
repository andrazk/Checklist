var core = core || {};
core.user = function(){
	return {
		//ATRIBUTES
		username: localStorage.getItem('username') || '',
		
		//METHODS
		login: function(username, password, success, error){
			localStorage.setItem('username', username);
			//TODO autorizacija s strežnikom
			this.username = username;
			if(success) success('Pozdravljen '+username);
			
			//if(error) error();
			
			core.notify('login', {
				username: username
			});
		},
		
		logout: function(){
			localStorage.removeItem('username');
			core.notify('logout');
		},
		
		auth: function(){
			var username = localStorage.getItem('username');
			if(username) return true;
			return false;
		}
	};
}();