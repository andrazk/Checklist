persistence.store.websql.config(persistence, 'checklist', 'checklist databse', 5 * 1024 * 1024);

var Project = persistence.define('Project',{
    name: "TEXT",
    description: "TEXT"
});

var Log = persistence.define('Log', {
    sid: "TEXT",
    iid: "TEXT",
    type: "TEXT",
    action: "TEXT",
    date: "DATE",
    user: 'TEXT'
});

var User = persistence.define('User', {
    email: "TEXT",
    name: "TEXT",
    surname: "TEXT",
    password: "TEXT"
});
//Log.index('sid',{unique:true});
Log.index('sid');
User.index('email',{unique:true});
//RELATIONS
persistence.schemaSync(function(tx){
    core.initialize();
});



//MODULES
var core = core || {};
core.initialize = function(){
    //core.socket = new Socket();
    core.sync = new Sync();
};

core.reset =function(){
    core.user.logout();
    
    var tables = ['Log', 'Project', 'User'];
    persistence.transaction(function(tx){
        for(var i=0; i<tables.length; i++){
            tx.executeSql('DROP TABLE '+tables[i], [], function(tx, result){
                console.log(result);
            }, function(tx, error){
                console.log(error);
            });
        }
    });
    
    core.sync.reset();
};




var modules = {};

core.register = function(id, module){
	id = id ? id : modules.length;
	modules[id] = module;
	return id;
};

core.start = function(id, options){
	modules[id].init(options);
};


//INTRO

core.register('status', module.statusBar);
core.register('dialog', module.dialog);

core.notify = function(type, data){
	for(var id in modules){
		modules[id].notify(type, data);
	}
};

core.start('dialog');

document.addEvent('domready', function(){
	
	core.start('status', {box: core.$('box')});

    //modules[0] = new module.ProjectList({box: $('box')});
    //modules[1] = new module.StatusBar({box: $('box')});
    core.fireEvent = function(type, args, delay){

        core.sync.fireEvent(type, args, delay);
        core.socket.fireEvent(type, args, delay);
        core.user.fireEvent(type, args, delay);

        modules[0].fireEvent(type, args, delay);
        modules[1].fireEvent(type, args, delay);
        
        core.log('Event fired: ', type, args);
    };
});










