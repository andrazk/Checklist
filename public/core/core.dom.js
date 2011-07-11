var core = core || {};

core.$ = document.id;
core.$$ = $$;

core.dom = function(){
	
	var worker = new Worker('../workers/render.js');
	var callbacks = [];
	
	worker.onmessage = function(e) {
		console.log('Render', e.data);
		if(callbacks[e.data.id]) callbacks[e.data.id](e.data.html);
	};
	
	return{
		//Insert module frame
		insertFrame: function(tag, box, options, success){
			var tag = tag || 'div';
			var frame = new Element(tag, options).inject(box);
			
			if(success) success(frame);
		},
		
		removeFrame: function(el){
			if(el.dispose)
				return el.dispose();
		},
		
		//Render templates with Mustache.js
		render: function(template, view, cb, partials){	
			
			var data = {
				template: template,
				view: view,
				partials: partials
			};
			
			if(cb){
				var id = new Date().getTime()+Math.floor(Math.random()*110);
				callbacks[id] = cb;
				data.id = id;
			}
			
			worker.postMessage(data);
		}	
	
	};
}();