
var persistence = require('persistencejs/persistence').persistence;
var persistenceStore = require('persistencejs/persistence.store.mysql');

persistenceStore.config(persistence, '127.0.0.1', '/var/run/mysqld/mysqld.sock', 'checklist', 'root', 'akdev');
var session;

var Log, Project, User;

session = persistenceStore.getSession();
session.transaction(function(tx) {
  console.log('Transaction defined');
  
  Project = persistence.define('Project',{
        name: "TEXT",
        description: "TEXT"
    });

   Log = persistence.define('Log', {
        iid: "TEXT",
        type: "TEXT",
        action: "TEXT",
        date: "DATE",
        user: 'TEXT'
    });

    User = persistence.define('User', {
        email: "TEXT",
        name: "TEXT",
        surname: "TEXT",
        password: "TEXT"
    });
    User.index('email',{unique:true});
    
    session.schemaSync(tx, function(){
        console.log('Schema synchronized');
        session.close();
    });
});


/////////////////////////////////////

var http = require('http'),
    io = require('socket.io'),

server = http.createServer(function(req, res){
 // your normal server code
 res.writeHead(200, {'Content-Type': 'text/html'});
 res.end('<h1>Ju ar konekted to socket server!</h1>');
 console.log('Server started - '+new Date());
});
server.listen(8080);

// socket.io
var socket = io.listen(server);
socket.on('connection', function(client){
  // new client is here!
  syncUsers(client);
  client.on('message', function(msg){
      switch(msg.req){
          case 'syncRemote':
              console.log('Sync Remote Request', msg.data.lastSync);
              syncServerData(msg.data, client);
              break;
          case 'syncLocal':
              /*
              console.log('Sync Local request', msg.data);
              syncLocalData(msg.data);
              */
              break;
          case 'broadcast':
              console.log('Broadcast request', msg.data.iid.name);
              //console.log(msg.data);
              broadcast(msg.data, client);
              break;
          default:
              console.log('Unkonwn request', msg);
      }


      
      
      
      
  }),
  client.on('disconnect', function(){
      console.log('Baj Baj...')
  })
});

var dbSave = function(data, callback){
    var session = persistenceStore.getSession();
    var iid = data.iid;
    var instance;
    switch(data.type){
        case 'Project':
            instance = new Project(session, {
                name: iid.name,
                description: iid.description
            });
            break;
        case 'User':
            instance = new User(session, {
                email: iid.email,
                password: iid.password,
                name: iid.name,
                surname: iid.surname
            });
            break;
    }

    var log = new Log(session, {
        iid: instance,
        type: data.type,
        action: data.action,
        date: data.date,
        user: data.user
    });
    session.transaction(function(tx){
        session.add(log);
        session.add(instance);
        session.flush(tx, function(){
            callback(log);
            session.close();
        });
    });
    
}

var broadcast = function(data, client){    
    dbSave(data, function(log){
        socket.broadcast({res: 'broadcast', data: log}, client.sessionId);
        client.send({
            res: 'logSaved',
            data: {
                logId: data.id,
                serverId: log.id
            }
        });
    });
}

var syncServerData = function(data, client){
    var session = persistenceStore.getSession();
    session.transaction(function(tx){
        Log.all(session).filter('date', '>', data.lastSync).order('date', true).list(tx, function(results){
            console.log('SYNCREMOTE ', results.length);
            session.close();
            results.forEach(function(log){
                console.log('NAPAKA 1');
                loadEntity(log, function(entity){
                    console.log('NAPAKA 2');
                    var sid = log.id;
                    log = log._data;
                    log.sid = sid;
                    console.log('NAPAKA 3');
                    log.iid = entity._data;
                    client.send({res:'broadcast', data:log});
                    console.log('NAPAKA 4');
                });
            });
        });
    });
}

var syncUsers = function(client){
    var session = persistenceStore.getSession();
    session.transaction(function(tx){
        User.all(session).list(tx, function(results){
            client.send({res:'syncUsers', data:{users: results}});
            console.log('Users sent!!!');
        });
    });
    session.close();
}


var loadEntity = function(log, callback){
    var self = this;
    var session = persistenceStore.getSession();
    session.transaction(function(tx){
        console.log('NAPAKA 11');
        switch(log.type){
            case 'Project':
                console.log('NAPAKA 12', log.iid);
                if(log.iid){
                    Project.load(session, tx, log.iid, callback);
                    console.log('NAPAKA 13');
                }
                console.log('NAPAKA 14');
                break;
        }
        session.close();
    });
}

