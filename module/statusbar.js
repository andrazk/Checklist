var module = (window && window.module) ? window.module : {};
module.StatusBar = new Class({

    //implements
    Implements: [Options, Events],

    //options
    options: {
        name: 'status-bar',
        box: $$('body'),
        frame: new Element('div', {id: this.name})
    },

    //initialization
    initialize: function(options) {
        var self = this;
        this.setOptions(options);
        this.tmpInit(function(){

        });

        this.addEvents({
            'newProject': function(data){
                var self = this;
                
            }
        });

    },

    addUser: function(){
        var user = new User({
            email: prompt('Enter email'),
            password: prompt('Enter password')
        });
        core.fireEvent('newUser', user);
    },


    //Templatzes
    tmpInit: function(callback){
        var self = this;
        this.el = {};
        this.options.box.adopt(this.options.frame);
        /////////
        self.tmpAddUserLink(this.options.frame);
        ////////
        callback();
    },
    tmpAddUserLink: function(frame){
        var self = this;
        var a = new Element('a', {
            html: 'New User',
            href: '#',
            events: {
                click: function(e){
                    e.stop();
                    self.addUser();
                }
            }
        }).inject(frame);
    }

});