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



//MODUKLES
var core = {};
core.initialize = function(){
    core.socket = new Socket();
    core.sync = new Sync();
    core.user = new UserClass();
}

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
}


var modules = [];
document.addEvent('domready', function(){

    modules[0] = new module.ProjectList({box: $('box')});
    modules[1] = new module.StatusBar({box: $('box')});
    core.fireEvent = function(type, args, delay){

        core.sync.fireEvent(type, args, delay);
        core.socket.fireEvent(type, args, delay);
        core.user.fireEvent(type, args, delay);

        modules[0].fireEvent(type, args, delay);
        modules[1].fireEvent(type, args, delay);
        
        console.log('Event fired: ', type, args);
    }
});










