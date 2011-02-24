var Sync = new Class({

    //implements
    Implements: [Options, Events],

    //options
    options: {

    },

    //initialization
    initialize: function(options) {
        //set options
        this.setOptions(options);
        //set events
        this.addEvents({
            'newProject': function(entity){
                var self = this;
                //Save Project;
                self.saveWebSQL(entity, function(){
                    self.logLocal('new', entity, function(log){
                        core.socket.broadcast(log);
                    });
                });                
            },
            'newRemoteProject': function(entity){
                var self = this;
                //Save project
                self.saveWebSQL(entity);
            },
            'newRemoteLog': function(object){
                var self = this;
                self.logRemote(object);
            },
            'newUser': function(entity){
                var self = this;
                self.saveWebSQL(entity, function(){
                    self.logLocal('new', entity, function(log){
                        core.socket.broadcast(log);
                    });
                });
                
            },
            'syncUsers': this.syncUsers,
            'userAuth': function(data){
                var self = this;
                self.syncData();
            },
            'socketConnected': function(data){
                var self = this;
                self.syncData();
            },
            'logSaved': function(data){
                Log.load(data.logId, function(log){
                    if(log)
                        log.sid = data.serverId;
                        persistence.add(log);
                        persistence.flush();
                });
            }
        });

    },
    saveWebSQL: function(entity, callback){
        var self =this;
        core.user.get(function(uid){
            persistence.add(entity);
            persistence.flush(callback);
        });
    },
    logLocal: function(action, entity, callback){
        var self = this
        core.user.get(function(uid){
            var log = new Log({
                sid: '0',
                iid: entity,
                type: entity._type,
                action: action,
                date: new Date(),
                user: uid
            });
            persistence.add(log);
            persistence.flush(function(){
                if(callback) callback(log);
            });
        });
    },
    logRemote: function(object){
        var self = this;
        var log = new Log({
            sid: object.sid,
            type: object.type,
            action: object.action,
            date: object.date,
            user: object.user
        });
        Log.all().filter('sid', '=', log.sid).one(function(exist){
            console.log('log Exist', log);
            if(!exist){
                self.makeEntity(object, function(entity){
                    log.iid = entity;
                    persistence.add(log);
                    persistence.flush(function(){
                        core.fireEvent('newRemote'+object.type, entity);
                    });
                });
            }
        });
    },

    syncRemoteData: function(){
        var lastSync = localStorage.getItem('lastRemoteSync') ? localStorage.getItem('lastRemoteSync') : 0;
        core.socket.send('syncRemote', {
            lastSync: lastSync
        });
        //localStorage.setItem('lastRemoteSync', new Date());
    },
    syncLocalData: function(){
        var self = this;
        Log.all().filter('sid', '=', '0').list(function(results){
            results.forEach(function(log){
                log.iid = log._data.iid;
                core.socket.broadcast(log);
                console.log('syncLocalData', log);
            });            
        });
    },

    syncData: function(){
        var self = this;
        self.syncRemoteData();
        self.syncLocalData();
    },

    syncUsers: function(data){
        var self = this;
        data.users.forEach(function(el){
            var user = new User({
                email: el.email,
                name: el.name,
                surname: el.surname,
                password: el.password
            });
            persistence.add(user);
        });       
        persistence.flush(null, function(){
            core.fireEvent('usersSynced');
        });
    },

    reset: function(){
        localStorage.setItem('lastLocaleSync', 0);
        localStorage.setItem('lastRemoteSync', 0);
    },
    makeEntity: function(log, callback){
        var self = this;
        var instance = {};
        switch(log.type){
            case 'Project':
                instance = new Project({
                    name: log.iid.name,
                    description: log.iid.description
                });
                break;
        }
        if(callback) callback(instance);
        
    }

});