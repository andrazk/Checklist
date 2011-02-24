var UserClass = new Class({

    //implements
    Implements: [Options, Events],

    //options
    options: {

    },
    data: {}, //user email


    //initialization
    initialize: function(options) {
        //set options
        this.setOptions(options);
        //set events
        this.addEvents({
            'usersSynced': function(data){
                this.get(function(uid){
                    if(uid) core.fireEvent('userAuth', uid);
                });
                
            }
        });
        //
        var uid = sessionStorage.getItem('user');
        if(uid) console.log(uid+' pozdravljen!!!');
    },

    login: function(callback){
        var email = prompt('Enter email');
        User.findBy('email', email, function(user){
            if(user){
                sessionStorage.setItem('user', user.email);
                this.data = user;
                core.fireEvent('userLoggedIn', user.email);
                if(callback) callback(user.email);
            }else{
                alert('User doesnt exist!');
                if(callback) callback(false);
            }
        });
    },

    logout: function(){
        var self = this;
        this.data = {};
        sessionStorage.setItem('user', '');
    },

    get: function(callback){
        var self = this;        
        var uid = sessionStorage.getItem('user');
        if(uid) callback(uid);
        else self.login(callback);
    }
});