var DBClass = new Class({

    //implements
    Implements: [Options, Events],

    //options
    options: {

    },
    persistence: {},
    project: {},

    //initialization
    initialize: function(options) {
        this.persistence = persistence;
        this.persistence.store.websql.config(persistence, 'checklist', 'checklist databse', 5 * 1024 * 1024);
        //set options
        this.setOptions(options);
        //set events
        this.addEvent('onConnect', function(data){

        });
        //this.dropTables();
    },

    dropTables: function(){
        var self = this;
        /*
        persistence.transaction(function(tx){
            tx.executeSql("SELECT * FROM sqlite_master", [], function(tx, results){
                console.log(results);
            }, function(tx, error){
                console.log('neeeeee', error);
            });
        });
        */
    }
});