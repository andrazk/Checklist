var Socket = new Class({

    //implements
    Implements: [Options, Events],

    //options
    options: {
        host: '192.168.1.100',
        port: 8080
    },
    socket: {},

    //initialization
    initialize: function(options) {
        //set options
        this.setOptions(options);
        //set events
        this.addEvent('onConnect', function(data){
            core.fireEvent('socketConnected', data);
        });
        this.socket = new io.Socket(this.options.host, {port: this.options.port});
        this.connect(),
        this.socket.on('connect', this.onConnect),
        this.socket.on('message', this.onMessage),
        this.socket.on('disconnect', this.onDisconnect)
    },

    connect: function(){
        this.socket.connect();
    },

    onConnect: function(){
        console.log('Socket Connected - '+new Date().getTime());
    },
    onDisconnect: function(){
        console.log('Socket Disconnected - '+new Date().getTime());
    },
    onMessage: function(msg){
        switch(msg.res){
            case 'broadcast':
                console.log('Broadcast response', msg);
                //core.fireEvent('newRemote'+msg.data.type, msg.data.iid);
                core.fireEvent('newRemoteLog', msg.data);
                break;
            case 'syncUsers':
                core.fireEvent('syncUsers', msg.data);
                break;
            case 'logSaved':
                console.log('Log Saved', msg);
                core.fireEvent('logSaved', msg.data);
                break;
            default:
                console.log('Unknown response', msg);
        }
    },
    send: function(req, data){
        // TODO: čakalna vrsta in callback funkcije ob uspešni dostavi.
        this.socket.send({
            req: req,
            data: data
        })
    },
    broadcast: function(log){
        var self = this;
        this.send('broadcast', log);
    }
});