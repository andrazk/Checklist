importScripts('../lib/mustache.js');

onmessage = function(e){
	Mustache.to_html(e.data.template, e.data.view, e.data.partials, function(html){
		var res = {html: html};
		if(e.data.id) res.id = e.data.id;
		postMessage(res);
	});
};