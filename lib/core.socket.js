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

        }),
        this.socket = new io.Socket(this.options.host, {port: this.options.port}),
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
            case 'sync':
                console.log('Sync response', msg);
                core.fireEvent('newSyncData', msg.data);
                break;
            case 'broadcast':
                console.log('Broadcast response', msg);
                core.fireEvent('newRemoteProject', msg.data.iid);
                break;
            default:
                console.log('Unknown response', msg);
        }
    },
    send: function(req, data){
        this.socket.send({
            req: req,
            data: data
        })
    }
});