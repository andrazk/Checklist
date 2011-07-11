/**
 * CONFIG
 */

var PORT = 80;
var DB_HOST = 'localhost';
var DB_PORT = 3306;
var DB_USER = 'root';
var DB_PASSWORD = '';
var DB_DATABASE = 'checklist';
var MANIFEST = 'cache6.manifest';

/**
 * NO CHANGES BEYOND THIS POINT
 * unless you know what you're doing!!!
 */

var resources = [
// Dependencies
'lib/socket.io.js',
'lib/persistence.js',
'lib/persistence.store.sql.js',
'lib/persistence.store.websql.js',
'lib/mootools-yui-compressed.js',
'lib/lightface/LightFace.js',
'lib/mustache.js',
'lib/form2object.js',
// CORE
'core/core.sync.js',
'core/core.socket.js',
'core/core.user.js',
'core/core.log.js',
'core/core.dom.js',
'core/core.history.js',
'core/core.db.js',
'core/core.misc.js',
// MODULES
'module/dialog.js',
'module/statusbar.js',
'module/projects.js',
'module/welcome.js',
'module/project.js',
'module/log.js',
'core/core.js'
];




var persistence = require('./persistence.js').persistence;
var persistenceStore = require('./persistence.store.mysql');
persistenceStore.config(persistence, DB_HOST, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD);
var Log, Project, User, Task, Comment;  	
Project = persistence.define('Project',{
    name: "TEXT",
    description: "TEXT"
    });

Log = persistence.define('Log', {
    lid: "TEXT", //Local ID
    iid: "TEXT", //Item ID
    type: "TEXT",
    action: "TEXT",
    date: "DATE",
    user: 'TEXT' //user id
});

User = persistence.define('User', {
    username: "TEXT", //email
    name: "TEXT",
    surname: "TEXT",
    password: "TEXT"
});
User.index('username', {unique:true});

Task = persistence.define('Task', {
	pid: "TEXT", //Project ID
	label: "TEXT",
	state: "BOOL"
});

Comment = persistence.define('Comment', {
	tid: "TEXT", //Task ID
	text: "TEXT",
	username: "TEXT",
	date: "DATE"
});

var session = persistenceStore.getSession();
var help = require('./helpers.js');

session.transaction(function(tx) {    
    session.schemaSync(tx, function(){
        session.close();
    });        
});



/**
 * Save new entry to log
 * @param entity Doticna entiteta
 * @param logObject Log Object options
 * @param cb Callback function
 */
var saveLog = function(session, tx, entity, logObject, cb){
	logObject = logObject || {};

	var log = new Log(session, {
		lid: logObject.lid || '0',
        iid: logObject.iid || entity.id,
        type: logObject.type || entity._type,
        action: logObject.action || 'new',
        date: logObject.date || new Date(),
        user: logObject.user
    });
    session.add(log);
    session.flush(function(){
        if(cb) cb(log, entity);
    });
};

/**
 * Create entity before saving
 * @param log
 * @param cb
 */
var createEntity = function(session, tx, log, obj, cb){
	if(!obj) return cb('Object missing');

		var entity = {};
		switch(log.type){
			case 'Project':
				entity = new Project(session, {
			  	    name:obj.name,
			  	    description: obj.description || ''
				});				
				break;
			case 'Task':
				entity = new Task(session, {
			    	pid: obj.pid || '0',
			    	label: obj.label,
			    	state: obj.state
				});
				break;
			case 'Comment':
				entity = new Comment(session, {
			    	tid: obj.tid,
			    	text: obj.text,
			    	username: obj.username,
			    	date: obj.date
				});
				break;
		}
		entity.id = log.iid;
		
		if(cb) cb(null, entity);
};

/**
 * Loads existing entitys
 * @param session DB session
 * @param tx db transaction
 * @param log with iid
 * @param cb have two parameters err and entity
 */
var loadEntity = function(session, tx, log, cb){
	//If action delete entity doesnt exists
	if(log.action == 'delete') return cb('Already deleted', null);
	if(typeof log.iid != 'string') return cb('Error iid type', null);
	switch(log.type){
		case 'Project':
			Project.load(session, tx, log.iid, function(e){
				if(e == null) return cb('Wasnt found!', null);
				cb(null, e);
			});
			break;
		
		case 'Task':
			Task.load(session, tx, log.iid, function(e){
				if(e == null) return cb('Wasnt found!', null);
				cb(null, e);
			});
			break;
		case 'Comment':
			Comment.load(session, tx, log.iid, function(e){
				if(e == null) return cb('Wasnt found!', null);
				cb(null, e);
			});
			break;
		case 'User':
			User.load(session, tx, log.iid, function(e){
				if(e == null) return cb('Wasnt found!', null);
				e.password = null;
				cb(null, e);
			});
			break;
	}
};



/**
 * EXPRESS
 */

var express = require('express');
var app = express.createServer();

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
    app.use(express.static(__dirname + '/public'));
    app.use('view engine', 'jade');
});

/**
 * Socket.IO
 */
var io = require('socket.io'),
	socket = io.listen(app); 

socket.on('connection', function(client){ 
	// new client is here! 
	client.on('message', function(msg){
		var self = this; //socket
		console.log('Socket Sync', msg);
		/**
		 * SYNC
		 */
		if(msg.log){
			var log = msg.log;
			var obj = msg.obj;
			
			/**
			 * Save and Send Log
			 * @param entity
			 * @param logObject
			 */
			var ssLog = function(session, tx, entity, logObject, cb){
				//sLog = Server Log
				saveLog(session, tx, entity, logObject, function(sLog, sEntity){
					//Send sid back
					client.send({type: 'sid', data: sLog});
					self.broadcast({type: sLog.action+sLog.type, data: sLog, object: sEntity}, client);
					//broadcast(sLog.action+sLog.type, sLog, client);
					cb(null, sLog);
				});
			};
			//Ustvari sejo
			var session = persistenceStore.getSession();
			session.transaction(function(tx){
				//TODO: Ni potrebno vedno ustvarjati nove entite, Vcasih se loada iz baze.
				createEntity(session, tx, log, obj, function(err, entity){
					var logObject = {
						lid: log.id,
						date: log.date,
						user: log.user,
						type: log.type,
						action: log.action
					};
					
					switch(log.action){
						case 'new':						
								session.add(entity);
								session.flush(function(){
									ssLog(session, tx, entity, logObject, function(){
										session.close();
									});
								});					
							break;
						case 'delete':
							logObject.action = 'delete';
							session.remove(entity);
							session.flush(function(){
								ssLog(session, tx, entity, logObject, function(){
									session.close();
								});
							});
							break;
						case 'check':
							logObject.action = 'check';
							Task.load(session, tx, entity.id, function(task){
								task.state = true;
								session.add(task).flush(function(){
									ssLog(session, tx, task, logObject, function(){
										session.close();
									});
								});
							});
							break;
						case 'uncheck':
							logObject.action = 'uncheck';
							Task.load(session, tx, entity.id, function(task){
								task.state = false;
								session.add(task).flush(function(){
									ssLog(session, tx, task, logObject, function(){
										session.close();
									});
								});
							});
							break;
					}
					
		
				});
			});

			
		/**
		 * SYNC TO LOCAL
		 */
		}else if(msg.lastSync){
			var lastSync = msg.lastSync ? new Date(msg.lastSync) : new Date(0);
			console.log('Sync To Local', lastSync);
			var session = persistenceStore.getSession();
			session.transaction(function(tx){
				Log.all(session).filter('date', '>', lastSync).order('date', false).order('iid').list(tx, function(results){
					console.log('Sync To Local Count', results.length);
					var latest = [];
					//Getlast
					//TODO: Poišci zadnje vpise.
					var session = persistenceStore.getSession();
					session.transaction(function(tx){
						help.aEach(results, function(log, cb){
							loadEntity(session, tx, log, function(err, entity){
								if(entity != null){
									client.send({type: log.action+log.type, data: log, object: entity});
								}
								cb();
							});
						}, function(){
							console.log('Sinhronizacija koncana!!!');
							session.close();
						});
					});					
				});
			});
		}
	});
	//client.on('disconnect', function(){}); 
});

/**
 * Brodcast message
 * @param type Type of event.
 * @param data Event data.
 * @param except Clints not to broadcast.
 */
var broadcast = function(type, data, except){
	console.log('Broadcast Message', type);
	socket.broadcast({type: type, data: data}, except);
};

/**
* ACCESS CONTROL
*/
var accessControl = function(req, res,  next){
	if(req.header('origin')){
		//TODO: Preveri izvor zahteve.
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	}
	next();
};
app.all('*', accessControl, function(req, res, next){		
	if(req.method == 'OPTIONS'){
		res.send(200);
	}else{
		next();
	}	
});

/**
 * USER LOGIN
 */
var loadUser = function(req, res, next){
	console.log('Start User Load');
	var session = persistenceStore.getSession();
	session.transaction(function(tx) {
		User.findBy(session, tx, 'username', req.params.username, function(user){
			session.close();
			if(user){
				req.user = user;
				console.log('User Loaded', user.username);
			}else{
				console.log('User Doesnt Exists');
			}
			next();
			/**
			if(user){
				req.user = user;
				next();
			}else{
				next(new Error('Failed to load user ' + req.params.username));
			}
			*/
			
		});
	});
}; 

app.get('/user/login/:username/:password', loadUser, function(req, res, next){
	if(!req.user) return res.send({error: 'User doesnt exists.'});
	
	if(req.user.password == req.params.password){
		res.contentType('json');
		return res.send(req.user);
	}else{
		return res.send({error: 'Login failed. Wrong password!!!!'});
	}
	//next();
});




/**
 * USER REGISTER
 */
app.get('/user/register/:username/:password/:name/:surname?', loadUser, function(req, res, next){
	console.log('Start User Register');
	
	req.user = req.user || {};
	req.user.username = req.user.username || '';
	if(req.user.username == req.params.username) 
		return res.send({error: 'User exists'});
	
	//Save user
	var session = persistenceStore.getSession();
	var user = new User(session, {
		username: req.params.username,
		name: req.params.name,
		surname: req.params.surname || '',
		password: req.params.password
	});
  	session.transaction(function(tx){
  		session.add(user);
		session.flush(tx, function(){
			var logObject = {
				user: req.params.username
			};
			saveLog(session, tx, user, logObject, function(sLog, sEntity){
				//Hide password
				sLog.iid.password = null;
				res.contentType('json');
				res.send(sLog);
				//broadcast('newuser', log);
				self.broadcast({type: sLog.action+sLog.type, data: sLog, object: sEntity});
				session.close();				
			});			
		});
	});
});

var indexRender = function(req, res){
	res.render('index.jade', {locals: {resources: resources, manifest: MANIFEST}, layout: false});
};

app.get('/', indexRender);
app.get('/intro', indexRender);
app.get('/projects', indexRender);
app.get('/project/*', indexRender);

app.get('/'+MANIFEST, function(req, res){
	res.header("Content-Type", "text/cache-manifest");
	var manifest = '\CACHE MANIFEST\n\
		/\n\
		/intro\n\
		/projects\n\
		style/style.css\n\
			style/lightface.css\n\
			style/button.png\n\
			style/fbloader.gif\n\
			style/icons.png\n\
			style/html5-badge.png\n\
			workers/render.js\n\
			lib/modernizr-1.7.min.js\n';
	for(var i=0; i<resources.length; i++){
		manifest += resources[i]+'\n';
	}
	res.send(manifest + 'FALLBACK:\n/ /intro\n');
	/**
	res.render('manifest.jade', {locals: {resources: resources}, layout: false});
	
	/**
	 * 
	 * , function(render){
		
		//res.header("Content-Type", "text/cache-manifest");
		res.send(render);
		
	}
	*/
	 
});
/**
 * ERROR HANDLER
 */
app.error(function(err, req, res, next){
	res.send(err);
});

app.listen(PORT);

process.on('uncaughtException', function(err) {
  console.log(err);
});