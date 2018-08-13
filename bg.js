var add_event = function(t, e, f, c) {
	var fn = function(e) {
		f.call(c, e);
	};
	
	t.addEventListener(e, fn, false);
};

var msg_listener = function(msg) {
	if(msg.str === 'status') {
		toggleEnable(config.enabled);
	}
};

var key = /(revs|chaps|words|favs|folls)/g;
var op = /(\/)/g;
var verify = /^\s*(revs|chaps|words|favs|folls)\s*(?:\/\s*(?:revs|chaps|words|favs|folls)\s*)?\s*$/;
var num = /^\d+(\.\d+)?$/;

var ports = {}, config = { enabled: true, inst: false, img: false, def: 'n' };

var CRITS = '__FF_FILTER__CRITS__', CONFIG = '__FF_FILTER__CONFIG__', TAGS = '__FF_FILTER__TAGS__';

var getCons = function() {
	var o = [];
	for(var k in cons) {
		o.push(cons[k].tab.id);
	}
	
	return o;
};

var Crit = function(id) {
	this.id = id;
	
	this.value = '';
	this.comp = '>';
	this.check = 0;
	
	this.status = 2;
	this.wrong = 'rgba(204, 51, 51, 0.2)';
	this.right = 'rgba(51, 204, 153, 0.2)';
	
	this._holder = document.createElement('div');
	this._holder.id = 'crit_' + this.id;
	this._holder.className = 'crit_holder';
	this._holder.style.position = 'relative';
	
	this._valueBox = document.createElement('div');
	this._valueBox.className = 'value_box';
	this._valueBox.style.position = 'absolute';
	this._valueBox.contentEditable = 'true';
	
	this._select = document.createElement('select');
	this._select.className = 'op_select';
	this._select.style.position = 'absolute';
	
	var opt1 = document.createElement('option');
	var opt2 = document.createElement('option');
	var opt3 = document.createElement('option');
	
	opt1.value = '>';
	opt1.text = '>';
	
	opt2.value = '<';
	opt2.text = '<';
	
	opt3.value = '=';
	opt3.text = '=';
	
	this._select.add(opt1, null);
	this._select.add(opt2, null);
	this._select.add(opt3, null);
	
	this._checkBox = document.createElement('div');
	this._checkBox.className = 'check_box';
	this._checkBox.style.position = 'absolute';
	this._checkBox.contentEditable = 'true';
	this._checkBox.innerText = 0;
	
	this._close = document.createElement('div');
	this._close.className = 'close';
	this._close.style.position = 'absolute';
	this._close.style.right = '2px';
	this._close.style.top = '2px';
	
	this.init();
	
	this._holder.appendChild(this._valueBox);
	this._holder.appendChild(this._select);
	this._holder.appendChild(this._checkBox);
	this._holder.appendChild(this._close);
};

Crit.prototype.init = function() {
	add_event(this._valueBox, 'keydown', this.blockKey, this);
	add_event(this._valueBox, 'keyup', this.type, this);
	add_event(this._select, 'change', this.select, this);
	add_event(this._checkBox, 'keydown', this.blockKey, this);
	add_event(this._checkBox, 'keyup', this.numType, this);
	add_event(this._close, 'click', this.remove, this);
};

Crit.prototype.blockKey = function(e) {
	var k = e.which ? e.which : e.keyCode;
	
	if(k === 13) {
		e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
	}
};

Crit.prototype.type = function(e) {
	var v = this._valueBox.innerText;
	
	if(this.value !== v) {
		this.value = v;
		this.evaluate();
	}
};

Crit.prototype.select = function(e) {
	this.comp = this._select.value;
	
	if(this.status === 1 && config.enabled)
		sendCrits();
};

Crit.prototype.numType = function(e) {
	var c = parseFloat(this._checkBox.innerText);
	
	if(this.check !== c) {
		this.check = c;
		this.evaluate();
	}
};

Crit.prototype.setValues = function(v, o, c) {
	this.value = v;
	this.comp = o;
	this.check = c;
	
	this._valueBox.innerText = this.value;
	this._select.value = this.comp;
	this._checkBox.innerText = this.check;
	
	this.evaluate(true);
};

Crit.prototype.evaluate = function(forceStop) {
	forceStop = forceStop || false;
	var _p = this.status;
	
	if(!verify.test(this.value)) {
		this.status = 0;
		this._holder.style.background = this.wrong;
		if(config.enabled && _p === 1 && !forceStop)
			sendCrits();
		return;
	}
	
	if(!num.test(this._checkBox.innerText)) {
		this.status = 0;
		this._holder.style.background = this.wrong;
		if(config.enabled && _p === 1 && !forceStop)
			sendCrits();
		return;
	}
	
	this.status = 1;
	this._holder.style.background = this.right;
	if(config.enabled && !forceStop) {
		sendCrits();
	}
};

Crit.prototype.remove = function(e) {
	_crits.removeCrit(this.id);
};

var CritHolder = function() {
	this._parent = null;
	this.inc = 0;
	this.crits = {};
};

CritHolder.prototype.loadCrits = function(c) {
	for(var i=0; i<c.length; ++i) {
		var o = new Crit(this.inc);
		o.setValues(c[i].value, c[i].comp, c[i].check);
		
		this.crits[''+this.inc] = o;
		++this.inc;
	}
};

CritHolder.prototype.addCrit = function() {
	this.crits[''+this.inc] = new Crit(this.inc);

	if(this._parent && this._parent.appendChild) {
		this._parent.appendChild(this.crits[''+this.inc]._holder);
	}
		
	++this.inc;
};

CritHolder.prototype.removeCrit = function(id) {
	var c = this.crits[''+id];
	var s = c.status;
	
	if(this._parent && this._parent.removeChild) {
		this._parent.removeChild(c._holder);
	}
	
	delete this.crits[''+id];
	
	if(config.enabled && s === 1)
		sendCrits();
};

CritHolder.prototype.populate = function(p) {
	if(p === null || !p.appendChild)
		return;
	
	this._parent = p;
	
	var i = 0;
	for(var k in this.crits) {
		this.crits[k].init();
		this._parent.appendChild(this.crits[k]._holder);
		++i;
	}
	
	if(i === 0) {
		this.addCrit();
	}
};

CritHolder.prototype.getCrits = function() {
	var c = [];
	
	for(var k in this.crits) {
		if(this.crits[k].status !== 1)
			continue;
			
		var o = {};
		o.value = this.crits[k].value.replace(/\s+/g, '');
		o.comp = this.crits[k].comp;
		o.check = this.crits[k].check;
		
		c.push(o);
	}
	
	var __t = {};
	__t[CRITS] = c;
	chrome.storage.sync.set(__t);
	return c;
};

var Tag = function(t, tp) {
	this.type = tp || (config.def === 'n' ? (/^\+/.test(t) ? 'p' : 'n') : (/^\-/.test(t) ? 'n' : 'p'));
	this.tag = t.replace(/^(\+|\-)/, '');
	
	this._holder = document.createElement('div');
	this._holder.className = this.type === 'p' ? 'tag_pos' : 'tag';
	
	var v = this.tag;
	if(this.tag.length > 20) {
		v = '';
		var i = 0;
		while (i + 20 < this.tag.length) {
			v = v + this.tag.substr(i, 20) + '<br />';
			i += 20;
		}
		v = v + this.tag.substr(i, 20);
	}
	else {
		this._holder.style.width = Math.floor(23.7 + (v.length*11.28)) + 'px';
	}
	
	this._span = document.createElement('div');
	this._span.className = 'tag_text';
	this._span.innerHTML = v;
	
	this._close = document.createElement('span');
	this._close.className = 'close';
	this._close.style.position = 'absolute';
	this._close.style.width = '14px';
	this._close.style.height = '14px';
	this._close.style.right = '2px';
	this._close.style.top = '4px';
	
	this._holder.appendChild(this._span);
	this._holder.appendChild(this._close);
	
	this.init();
};

Tag.prototype.init = function() {
	add_event(this._close, 'click', this.remove, this);
};

Tag.prototype.remove = function() {
	_tags.removeTag(this.tag.toLowerCase());
};

var TagHolder = function() {
	this._parent = null;
	this.tags = {};
};

TagHolder.prototype.loadTags = function(a) {
	for(var i=0; i<a.length; ++i) {
		this.tags[''+a[i].tag.toLowerCase()] = new Tag(a[i].tag, a[i].type);
	}
};

TagHolder.prototype.addTag = function(t) {
	if(this.tags[t.replace(/^(\+|\-)/, '').toLowerCase()])
		return;
	
	this.tags[''+t.replace(/^(\+|\-)/, '').toLowerCase()] = new Tag(t);
	
	if(this._parent && this._parent.appendChild) {
		this._parent.appendChild(this.tags[''+t.replace(/^(\+|\-)/, '').toLowerCase()]._holder);
	}

	if(config.enabled)
		sendTags();
};

TagHolder.prototype.removeTag = function(t) {
	var _t = this.tags[''+t];
	
	if(this._parent && this._parent.removeChild) {
		this._parent.removeChild(_t._holder);
	}
	
	delete this.tags[''+t];
	
	if(config.enabled)
		sendTags();
};

TagHolder.prototype.populate = function(p) {
	if(p === null || !p.appendChild)
		return;
	
	this._parent = p;
	
	for(var k in this.tags) {
		this.tags[k].init();
		this._parent.appendChild(this.tags[k]._holder);
	}
};

TagHolder.prototype.getTags = function() {
	var o = [];
	
	for(var k in this.tags) {
		var t = {};
		t.tag = k;
		t.type = this.tags[k].type;
		
		o.push(t);
	}
	
	var __t = {};
	__t[TAGS] = o;
	chrome.storage.sync.set(__t);
	
	return o;
};

var _crits = new CritHolder();
var _tags = new TagHolder();

var sendCrits = function() {
	var _c = _crits.getCrits();
	
	for(var k in ports) {
		if(ports[k] && ports[k].postMessage)
			ports[k].postMessage({str: 'crits', crits: _c});
	}
};

var sendTags = function() {
	var _t = _tags.getTags();
	
	for(var k in ports) {
		if(ports[k] && ports[k].postMessage)
			ports[k].postMessage({str: 'tags', tags: _t});
	}
};

var sendImg = function() {
	for(var k in ports) {
		if(ports[k] && ports[k].postMessage)
			ports[k].postMessage({str: 'img', img: config.img});
	}
};

var toggleEnable = function(en) {
	config.enabled = en;
	var m = config.enabled ? 'enable' : 'disable';
	var _c = _crits.getCrits();
	var _s = _tags.getTags();
	for(var k in ports) {
		if(ports[k] && ports[k].postMessage)
			ports[k].postMessage({str: m, crits: _c, tags: _s, img: config.img});
	}
	
	var __t = {};
	__t[CONFIG] = config;
	chrome.storage.sync.set(__t);
};

var enablePort = function(p) {
	if(!p || !p.postMessage)
		return;
		
	var _c = _crits.getCrits();
	var _s = _tags.getTags();
	p.postMessage({str: 'enable', crits: _c, tags: _s, img: config.img});
};

var saveConfig = function() {
	var __t = {};
	__t[CONFIG] = config;
	chrome.storage.sync.set(__t);
};

chrome.runtime.onMessage.addListener(function(msg, sndr, respFn) {
	if(msg === null || !msg.str)
		return;
		
	if(msg.str === 'con_rqst') {
		chrome.pageAction.show(sndr.tab.id);
		
		if(!msg.val)
			return;
			
		var p = chrome.tabs.connect(sndr.tab.id);
		p.onMessage.addListener(msg_listener);
		
		ports[sndr.tab.id] = p;
		p.onDisconnect.addListener(function() { delete ports[sndr.tab.id]; } );
		
		if(config.enabled)
			enablePort(p);
	}
});

chrome.storage.sync.get(CRITS, function(res) {
	if(Object.hasOwnProperty.call(res, CRITS)) {
		console.log('crits found:');
		console.log(res[CRITS]);
		_crits.loadCrits(res[CRITS]);
	}
	else {
		console.log('no crits found');
	}
});

chrome.storage.sync.get(TAGS, function(res) {
	if(Object.hasOwnProperty.call(res, TAGS)) {
		console.log('TAGS found:');
		console.log(res[TAGS]);
		_tags.loadTags(res[TAGS]);
	}
	else {
		console.log('no TAGS found');
	}
});

chrome.storage.sync.get(CONFIG, function(res) {
	if(Object.hasOwnProperty.call(res, CONFIG)) {
		config = res[CONFIG];
	}
});