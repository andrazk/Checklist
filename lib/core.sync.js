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
        this.addEvent('newProject', function(data){
            var self = this;
            //Save Project;
            core.sync.save(data);
            self.logLocal('new', 'Project', data);
        });
        this.addEvent('newRemoteProject', function(data){
            var self = this;
            //Save project
            var project = new Project({
                name: data.name,
                description: data.description
            });
            self.save(project);
            //Save log
            self.logRemote('new', 'Project', project);
        });
        this.addEvent('newSyncData', function(data){
            var self = this;
            localStorage.setItem('lastRemoteSync', new Date());
            core.fireEvent('newRemoteProject', data.iid);
        });
        this.syncServerData();
        this.syncLocalData();
    },

    save: function(obj, callback){
        var self = this;
        persistence.add(obj);
        persistence.flush(null, function(){
            if(callback) callback();
        });
    },

    log: function(action, type, data, callback){
        //Save Log
        var log = new Log({
            iid: data,
            type: type,
            action: action,
            date: new Date()
        });
        this.save(log, function(){
            if(callback) callback(log);
        });
        
        
    },

    logLocal: function(action, type, data){
        this.log(action, type, data, function(log){
            core.socket.send('broadcast', log);
        });
    },

    logRemote: function(action, type, data){
        var log = this.log(action, type, data);
    },

    syncServerData: function(){
        var lastSync = localStorage.getItem('lastRemoteSync') ? localStorage.getItem('lastRemoteSync') : 0;
        core.socket.send('sync', lastSync);
        
    },
    syncLocalData: function(){
        var lastSync = localStorage.getItem('lastLocaleSync') ? localStorage.getItem('lastLocaleSync') : 0;
        Log.all().filter('date', '>', lastSync).list(function(results){
            results.each(function(log){
                if(log)
                    Project.load(log.iid, function(project){
                        log.iid = project;
                        core.socket.send('broadcast', log);
                        localStorage.setItem('lastLocaleSync', new Date());
                    });
            });
        });
    }

});