persistence.store.websql.config(persistence, 'checklist', 'checklist databse', 5 * 1024 * 1024);

var Project = persistence.define('Project',{
    name: "TEXT",
    description: "TEXT"
});

var Log = persistence.define('Log', {
    iid: "TEXT",
    type: "TEXT",
    action: "TEXT",
    date: "DATE"
});

//RELATIONS

persistence.schemaSync();



//MODUKLES
var core = {};
core.socket = new Socket();
core.sync = new Sync();

var modules = [];
document.addEvent('domready', function(){
    modules[0] = new module.ProjectList({box: $('box')});
    core.fireEvent = function(type, args, delay){
        core.sync.fireEvent(type, args, delay);
        modules[0].fireEvent(type, args, delay);

    }
});









//OFFLINE
// When the page loads, set the status to online or offline
function supports_offline() {
  //return !!window.applicationCache;
  console.log(window.applicationCache);
}
supports_offline();

// Now add event listeners to notify a change in online status
window.addEventListener("online", function(e) {
  console.log("Online");
}, true);

window.addEventListener("offline", function(e) {
  console.log("Offline");
}, true); 
