var module = (window && window.module) ? window.module : {};
module.ProjectList = new Class({

    //implements
    Implements: [Options, Events],

    //options
    options: {
        name: 'project-list',
        box: $$('body'),
        frame: new Element('div', {id: this.name})
    },

    //initialization
    initialize: function(options) {
        var self = this;
        this.setOptions(options);
        this.tmpInit(function(){
           self.getProjects();
        });

        this.addEvents({
            'newProject': function(data){
                var self = this;
                self.tmpProject(data);
            },
            'newRemoteProject': function(data){
                var self = this;
                self.tmpProject(data);
            }
        });

    },

    getProjects: function() {
        var self = this;
        Project.all().list(null, function(results){
            results.each(function(el){
                self.tmpProject(el);
            });
        });
    },
    newProject: function(obj){

    },

    //Templatzes
    tmpInit: function(callback){
        this.el = {};
        this.options.box.adopt(this.options.frame);
        this.tmpForm();
        callback();
    },
    tmpProjectList: function(){
        this.el.list = new Element('ul');
        this.el.list.inject(this.options.frame);
    },
    tmpProject: function(data){
        var self = this;
        if(!self.el.list) self.tmpProjectList();
        var el = new Element('li', {html: data.name});
        el.inject(self.el.list);
    },
    tmpForm: function(){
        var self = this;
        this.el.form = new Element('form', {
            events: {
                submit: function(e){
                    e.stop();
                    var obj = new Project({});
                    obj.name = self.el.input.get('value');
                    core.fireEvent('newProject', obj);
                    self.el.input.set('value', '');
                }
            }
        });
        this.el.form.inject(this.options.frame);
        this.el.input = new Element('input', {
            type: 'text',
            placeholder: 'Ime projekta'
        }).inject(this.el.form);
        new Element('input', {
            type: 'submit'
        }).inject(this.el.form);
    }

});