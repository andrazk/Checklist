persistence.store.websql.config(persistence, 'checklist', 'checklist databse', 5 * 1024 * 1024);

var Project = persistence.define('Project',{
    name: "TEXT",
    description: "TEXT"
});

var Log = persistence.define('Log', {
    sid: "TEXT",
    iid: "TEXT", //Item ID
    type: "TEXT",
    action: "TEXT",
    date: "DATE",
    user: 'TEXT'
});

var User = persistence.define('User', {
    username: "TEXT",
    name: "TEXT",
    surname: "TEXT"
});

var Task = persistence.define('Task', {
	pid: "TEXT", //Project ID
	label: "TEXT",
	state: "BOOL"
});

var Comment = persistence.define('Comment', {
	tid: "TEXT", //Task ID
	text: "TEXT",
	username: "TEXT",
	date: "DATE"
});
//Log.index('sid',{unique:true});
Log.index('sid');
User.index('username',{unique:true});
//RELATIONS
persistence.schemaSync(function(tx){
    core.initialize();
});



//MODULES
var core = core || {};
core.initialize = function(){
    
};

core.reset =function(){
    core.user.logout();
    
    var tables = ['Log', 'Project', 'User', 'Task', 'Comment'];
    persistence.transaction(function(tx){
        for(var i=0; i<tables.length; i++){
            tx.executeSql('DROP TABLE '+tables[i], [], function(tx, result){
                console.log(result);
            }, function(tx, error){
                console.log(error);
            });
        }
    });
    sessionStorage.clear();
    localStorage.clear();
    //core.sync.reset();
};




var modules = {};

core.register = function(id, module){
	id = id ? id : modules.length;
	modules[id] = module;
	return id;
};

core.start = function(id, options){
	if(modules[id].instance) return;
	//ELSE
	modules[id].instance = modules[id];
	var module = modules[id].instance;
	options = options || {};
	var box = options.box || module.box;
	core.dom.insertFrame(
		module.tag, 
		box, 
		{'id': id, 'class': module.klass},
		function(el){
			module.frame = el;
			module.init(id, options);
		}
	);
	//console.log(modules[id]);
};

core.stop = function(id){
	core.dom.removeFrame(modules[id].frame);
	if(modules[id].instance && modules[id].instance.destroy)
		modules[id].instance.destroy();
	modules[id].instance = null;
};

core.notify = function(type, data){
	console.log('Notify', type, data);
	for(var id in modules){
		if(modules[id].instance)
			modules[id].instance.notify(type, data);
	}
};


//INTRO

core.register('statusbar', module.statusBar);
core.register('dialog', module.dialog);
core.register('projects', module.projects);
core.register('project', module.project);
core.register('welcome', module.welcome);

core.stateChanged = function(url){
	
	/**
	core.stop('welcome');
	core.stop('projects');
	core.stop('project');
	*/
	switch(url.get[0]){
	//TODO: Neki uštimat da ni treba zmeraj vsakega posebej zapirat
		case 'projects':
			core.start('projects', {box: core.$('left')});
			core.stop('project');
			core.stop('welcome');
			return;
		case 'project':
			core.start('project', {box: core.$('left')});
			core.stop('projects');
			core.stop('welcome');
			return;
		default:
			core.start('welcome');
			core.stop('project');
			core.stop('projects');
			return;
	};
};

core.stateChanged(core.history.parseURL(location.href));



document.addEvent('domready', function(){
	
	core.start('dialog');
	core.start('statusbar', {box: core.$('header')});
	


});