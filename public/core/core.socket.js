var core = core || {};

core.socket = new io.Socket('checklist.no.de');

core.socket.connect();
core.socket.on('connect', function(){
	console.log('Socket Connected');
});
core.socket.on('message', function(msg){
	var type = msg.type,
		data = msg.data,
		object = msg.object;
	console.log('Socket Message', type, data);
	switch(type){
		/**
		case 'newUser':
			//check if exists
			core.db.checkSID(data.id, function(){
				var user = {
					username: object.username,
					name: object.name,
					surname: object.surname
				};
				core.db.saveUser(user, function(err, entity){
					core.notify('newuser', entity);
				});
			});
			return;
			*/
		case 'sid':
			Log.load(data.lid, function(log){
				if(log){
					log.sid = data.id;
					persistence.add(log);
					persistence.flush();
				}
			});
			return;
		default:
			core.sync.one(data, object);
			return;
	};
});

core.socket.on('disconnect', function(){
	console.log('Socket Disconnected');
});
//core.socket.send('some data');


/**
core.sse = new EventSource('');

core.sse.onopen = function(){
	console.log('SSE Connected');
};

core.sse.onmessage = function(msg){
	var type = msg.type,
		data = msg.data;
	console.log('SSE Message', type, data);
};

core.sse.onerror = function(e){
	console.log('SSE Error', e);
};
*/