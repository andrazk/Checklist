var core = core || {};

core.history = function(){
	return {
		pushState: history.pushState,
		
		parseURL: function(url){
			var a =  document.createElement('a');
		    a.href = url;
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
					}
					return ret;
				})(),
				file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
				hash: a.hash.replace('#',''),
				path: a.pathname.replace(/^([^\/])/,'/$1'),
				relative: (a.href.match(/tp:\/\/[^\/]+(.+)/) || [,''])[1],
				get: a.pathname.replace(/^\//,'').split('/')
			};
		}
	};
}();

core.action = function(a){
	switch(a){
	case 'logout':
		core.user.logout();
		return;
	}
};

//PREVENT redirect
document.addEvent('click', function(e){
	if(e.target.href){
		e.preventDefault();
		history.pushState(null, null, e.target.href);
		var url = core.history.parseURL(e.target.href);
		core.notify('refresh', url);
		if(url.params.action) core.action(url.params.action);
	}
	
});

//ACTIONS

