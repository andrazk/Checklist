persistence.store.websql.config(persistence, 'checklist', 'checklist databse', 5 * 1024 * 1024);

var Project = persistence.define('Project',{
    name: "TEXT",
    description: "TEXT"
});

var Log = persistence.define('Log', {
    sid: "TEXT",
    iid: "TEXT", //Item ID
    type: "TEXT",
    action: "TEXT",
    date: "DATE",
    user: 'TEXT'
});

var User = persistence.define('User', {
    username: "TEXT",
    name: "TEXT",
    surname: "TEXT"
});

var Task = persistence.define('Task', {
	pid: "TEXT", //Project ID
	label: "TEXT",
	state: "BOOL"
});

var Comment = persistence.define('Comment', {
	tid: "TEXT", //Task ID
	text: "TEXT",
	username: "TEXT",
	date: "DATE"
});
//Log.index('sid',{unique:true});
Log.index('sid');
User.index('username',{unique:true});
//RELATIONS
persistence.schemaSync(function(tx){
    core.initialize();
});



//MODULES
var core = core || {};
core.initialize = function(){
    
};

core.reset =function(){
    core.user.logout();
    
    var tables = ['Log', 'Project', 'User', 'Task', 'Comment'];
    persistence.transaction(function(tx){
        for(var i=0; i<tables.length; i++){
            tx.executeSql('DROP TABLE '+tables[i], [], function(tx, result){
                console.log(result);
            }, function(tx, error){
                console.log(error);
            });
        }
    });
    sessionStorage.clear();
    localStorage.clear();
    //core.sync.reset();
};




var modules = {};

core.register = function(id, module){
	id = id ? id : modules.length;
	modules[id] = module;
	return id;
};

core.start = function(id, options){
	if(modules[id].instance) return;
	//ELSE
	modules[id].instance = modules[id];
	var module = modules[id].instance;
	options = options || {};
	var box = options.box || module.box;
	core.dom.insertFrame(
		module.tag, 
		box, 
		{'id': id, 'class': module.klass},
		function(el){
			module.frame = el;
			module.init(id, options);
		}
	);
	//console.log(modules[id]);
};

core.stop = function(id){
	core.dom.removeFrame(modules[id].frame);
	if(modules[id].instance && modules[id].instance.destroy)
		modules[id].instance.destroy();
	modules[id].instance = null;
};

core.notify = function(type, data){
	console.log('Notify', type, data);
	for(var id in modules){
		if(modules[id].instance)
			modules[id].instance.notify(type, data);
	}
};


//INTRO

core.register('statusbar', module.statusBar);
core.register('dialog', module.dialog);
core.register('projects', module.projects);
core.register('project', module.project);
core.register('welcome', module.welcome);
core.register('log', module.log);

core.stateChanged = function(url){
	
	/**
	core.stop('welcome');
	core.stop('projects');
	core.stop('project');
	*/
	switch(url.get[0]){
	//TODO: Neki uštimat da ni treba zmeraj vsakega posebej zapirat
		case 'projects':
			core.start('projects', {box: core.$('left')});
			core.start('log', {box: core.$('right')});
			core.stop('project');
			core.stop('welcome');
			return;
		case 'project':
			core.start('project', {box: core.$('left')});
			core.start('log', {box: core.$('right')});
			core.stop('projects');
			core.stop('welcome');
			return;
		default:
			core.start('welcome');
			core.stop('log');
			core.stop('project');
			core.stop('projects');
			return;
	};
};

core.stateChanged(core.history.parseURL(location.href));



document.addEvent('domready', function(){
	
	core.start('dialog');
	core.start('statusbar', {box: core.$('header')});
	


});

/**
 * CORE URL
 */
core.url = {
		 
	// public method for url encoding
	encode : function (string) {
		return escape(this._utf8_encode(string));
	},
 
	// public method for url decoding
	decode : function (string) {
		return this._utf8_decode(unescape(string));
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
	 
};

core.misc = core.misc || {};
/**
 * Reflow arrays
 * @param array Array to proccess
 * @param cb Callback function
 */
core.misc.reflow = function(array, cb){
	var tmpArray = [],
		i = 0,
		l = array.length;
	
	for(x = 0; x < l; x++){
		if(typeof array[x] == 'object'){
			tmpArray[i] = array[x];
			i++;
		}
	}
	
	if(cb) cb(tmpArray);
};

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

core.date = core.date || {};
core.date.dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = core.date.dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
core.date.dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
core.date.dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return core.date.dateFormat(this, mask, utc);
};
core.date.format = function(date, mask, utc){
	mask = mask || 'd.m.yyyy HH:MM';
	return core.date.dateFormat(date, mask, utc);
};


core.xhr = core.xhr || {};
core.xhr = new XMLHttpRequest();









