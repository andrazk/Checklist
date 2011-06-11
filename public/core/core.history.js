var core = core || {};

core.history = function(){
	return {
		state: {
			intro: {
				title: 'Prva stran',
				url: 'intro'
			},
			projects: {
				title: 'Tvoji projekti',
				url: 'projects'
			},
			project: {
				title: 'En projekti',
				url: 'project'
			}
		},
		
		get: [],
		params: [],
		last: location.href,
		
		pushState: function(data, title, url){
			this.last = location.href;
			history.pushState(data, title, url);
			window.onpopstate();
			/**
			var parsedURL = this.parseURL(location.href);
			
			core.stateChanged(parsedURL);
			core.notify('refresh', parsedURL);
			core.action(parsedURL);
			*/
		},
		
		push : function(url){
			this.pushState(null, null, url);
		},
		
		replaceState: function(data, title, url){
			this.last = location.href;
			history.replaceState(data, title, url);
			window.onpopstate();
			/**
			var parsedURL = this.parseURL(location.href);
			
			core.stateChanged(parsedURL);
			core.notify('refresh', parsedURL);
			core.action(parsedURL);
			*/
		},
		
		replace: function(url){
			this.replaceState(null, null, url);
		},
		
		parseURL: function(url){
			var a =  document.createElement('a');
		    a.href = url;
		    this.get = a.pathname.replace(/^\//,'').split('/');
		    this.params = function(){
					var ret = {},
					seg = a.search.replace(/^\?/,'').split('&'),
					len = seg.length, i = 0, s;
				for (;i<len;i++) {
					if (!seg[i]) { continue; }
					s = seg[i].split('=');
					ret[s[0]] = s[1];
					//this.params[s[0]] = s[1];
				}
				return ret;
			}();
			return {
				source: url,
				protocol: a.protocol.replace(':',''),
				host: a.hostname,
				port: a.port,
				query: a.search,
				params: (function(){
					var ret = {},
						seg = a.search.replace(/^\?/,'').split('&'),
						len = seg.length, i = 0, s;
					for (;i<len;i++) {
						if (!seg[i]) { continue; }
						s = seg[i].split('=');
						ret[s[0]] = s[1];
						//this.params[s[0]] = s[1];
					}
					return ret;
				})(),
				file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
				hash: a.hash.replace('#',''),
				path: a.pathname.replace(/^([^\/])/,'/$1'),
				relative: (a.href.match(/tp:\/\/[^\/]+(.+)/) || [,''])[1],
				get: a.pathname.replace(/^\//,'').split('/')
			};
		},
		
		get: function(i){
			var get = this.parseURL(location.href).get;
			return get[i];			
		}
	};
}();

core.action = function(a){
	a.params = a.params || {};
	a.params.action = a.params.action || '';
	switch(a.params.action){
		case 'logout':
			core.user.logout();
			core.history.pushState(
				null,
				core.history.state.intro.title,
				core.history.state.intro.url
			);
			return;
		case 'sync':
			core.sync.sync();
			core.history.replace(core.history.last);
			return;
	}
};

//PREVENT redirect
//Links
document.addEvent('click', function(e){
	if(e.target.href){
		//redirect
		if(e.target.hasClass('follow'))
			return true;
			//location.assign(e.target.href);
		
		//else block
		e.preventDefault();
		core.history.pushState(null, null, e.target.href);
		
	}	
});

//Forms
document.addEvent('submit', function(e){
	if(e.target.hasClass('follow')) return true;
	
	e.preventDefault();
	
	console.log('event', e);
	core.history.pushState(null, null, 	e.target.action + e.target.toQueryString());
});

window.onpopstate = function(){
	//core.history.last = location.href;
	var url = core.history.parseURL(location.href);
	if(url.params.action){
		core.action(url.params.action);
		//core.notify('', url);
	}
	
	core.stateChanged(url);
	core.notify('refresh', url);	
};

//ACTIONS

