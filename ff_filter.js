var add_event = function(t, n, f, c) {
	var fn = function(e) {
		f.call(c, e);
	};
	
	t.addEventListener(n, fn, false);
};

var Option = function(p, v, t) {
	this._ms = p;
	this.value = v;

	this.id = this._ms._optionList.length;
	
	this.hol = document.createElement('div');
	this.chk = document.createElement('span');
	this.txt = document.createElement('span');
		
	this.hol.className = 'char_fil_hol';
	this.hol.style.textAlign = 'left';
		
	this.chk.innerHTML = '&nbsp;&#10004;&nbsp;';
	this.chk.className = 'char_fil_chk';
	this.chk.style.float = 'left';
	this.chk.style.marginLeft = '10px';
	this.chk.style.marginRight = '7px';
		
	this.sel = 0;
	
	add_event(this.chk, 'click', this._clickChk, this);
		
	this.txt.innerHTML = t;
		
	this.hol.appendChild(this.chk);
	this.hol.appendChild(this.txt);
		
	if(this._ms._tp > 0) {
		this.crs = document.createElement('span');
			
		this.crs.innerHTML = '&nbsp;&#10006;&nbsp;';
		this.crs.className = 'char_fil_crs';
		this.crs.style.float = 'right';
		this.crs.style.marginRight = '10px';
		
		add_event(this.crs, 'click', this._clickCrs, this);
		
		this.hol.appendChild(this.crs);
	}
};

Option.prototype._clickChk = function() {
	if(this._ms._all && this._ms._all.selected) this._ms._all.unselect(1);
			
	if(this.sel === 1) {
		this.unselect();
	}
	else {
		this.select();
	}
};

Option.prototype._clickCrs = function() {
	if(this._ms._all && this._ms._all.selected) this._ms._all.unselect(1);
				
	if(this.sel === 2) {
		this.unselect();
	}
	else {
		this.nselect();
	}
};

Option.prototype.select = function(_sup) {
	this.sel = 1;
	this.hol.className = 'char_fil_tex_sel';
	this.chk.className = 'char_fil_bt';
			
	if(this.crs)
		this.crs.style.visibility = 'hidden';
			
	this._ms._included['' + this.id] = true;
			
	this._ms._numSel = Math.min(this._ms._optionList.length, this._ms._numSel+1);
			
	if(!_sup) {
		this._ms._chng = +Date.now();
	}
};
	
Option.prototype.unselect = function(_sup) {
	this.sel = 0;
	this.hol.className = 'char_fil_hol';
	this.chk.className = 'char_fil_chk';
	this.chk.style.visibility = 'visible';
			
	this._ms._included['' + this.id] = false;
			
	if(this.crs) {
		this.crs.className = 'char_fil_crs';
		this.crs.style.visibility = 'visible';
				
		this._ms._excluded['' + this.id] = false;
	}
			
	this._ms._numSel = Math.max(0, this._ms._numSel-1);
			
	if(this._ms._all && this._ms._numSel === 0)
		this._ms._all.selected = true;
				
	if(!_sup) {
		this._ms._chng = +Date.now();
	}
};
		
Option.prototype.nselect = function(_sup) {
	if(!this.crs)
		return;
				
	this.sel = 2;
	this.hol.className = 'char_fil_tex_neg';
	this.crs.className = 'char_fil_bt';
			
	this.chk.style.visibility = 'hidden';
		
	this._ms._excluded['' + this.id] = true;
			
	this._ms._numSel = Math.min(this._ms._optionList.length, this._ms._numSel+1)
			
	if(!_sup) {
		this._ms._chng = +Date.now();
	}
};
	
var MultiSelect = function(inp, t) {
	this.el = document.createElement('div');
	
	this._tp = Number(t) || 0;

	this._mw = 0;
	this._numSel = 0;
	
	this.sel = document.createElement('div');
	this.sel.tabIndex = '0';
	this.sel.style.display = 'inline-block';
	this.sel.style.position = 'relative';
	this.sel.style.webkitUserSelect = 'none';
	this.sel.style.maxWidth = '1000px';
	
	this.optionsEl = document.createElement('div');
    this.optionsEl.style.cssText = 'max-height:300px !important';
	this.optionsEl.style.overflowY = 'auto';
	this.optionsEl.style.display = 'none';
	this.optionsEl.style.background = '#ffffff';
	this.optionsEl.style.position = 'absolute';
	this.optionsEl.style.minWidth = '250px';
	this.optionsEl.style.paddingTop = '5px';
	this.optionsEl.style.paddingBottom = '5px';
	this.optionsEl.style.border = 'solid 1px #99ccff';
	
	
	this.ddEl = document.createElement('span');
	this.ddEl.style.cursor = 'pointer';
	this.ddEl.innerHTML = '&nbsp;&nbsp;' + inp + ' ' + String.fromCharCode(0x25BC) + '&nbsp;&nbsp;';
	
	this.btn = document.createElement('button');
	this.btn.innerHTML = '&nbsp;&nbsp;Apply Character Filter&nbsp;&nbsp;';
	
	add_event(this.sel, 'focus', this._showDropDown, this);
	add_event(this.sel, 'blur', this._hideDropDown, this);
	add_event(this.ddEl, 'click', this._clickDropDown, this);
	add_event(this.btn, 'click', this._applyBtn, this);
	
	this.sel.appendChild(this.ddEl);
	this.sel.appendChild(this.optionsEl);
	
	this.el.appendChild(this.sel);
	this.el.appendChild(this.btn);
	
	this._optionList = [];
	this._included = {};
	this._excluded = {};
	
	this._changeFn = function() {};
	
	this._all = null;
	this._chng = null;
	this._lastChng = null;
};

MultiSelect.prototype._showDropDown = function(e) {
	this.optionsEl.style.display = 'block';
	if(this._all && this._numSel < 1)
		this._all.select(1);
};

MultiSelect.prototype._hideDropDown = function(e) {
	this.optionsEl.style.display = 'none';
};

MultiSelect.prototype._clickDropDown = function(e) {
	if(this.optionsEl.style.display === 'none')
		this.optionsEl.style.display = 'block';
	else
		this.optionsEl.style.display = 'none';
};

MultiSelect.prototype._applyBtn = function(e) {
	if(this._chng && this._chng !== this._lastChng) {
		this._lastChng = this._chng;
		this._changeFn();
	}
};

MultiSelect.prototype._allClick = function(e) {
	if(this._all.selected) {
		this._all.unselect();
	}
	else {
		this._all.select();
	}
};

MultiSelect.prototype._unselectOptions = function() {
	for(var i in this._included) {
		if(this._included[i])
			this._optionList[parseInt(i, 10)].unselect(1);
	}
		
	for(var i in this._excluded) {
		if(this._excluded[i])
			this._optionList[parseInt(i, 10)].unselect(1);
	}
};
	
MultiSelect.prototype._findMaxWidth = function(el) {	
	var _pos = el.style.position;
		
	el.style.position = 'absolute';
	el.style.top = '-99999px';
	el.style.left = '-99999px';
		
	document.documentElement.appendChild(el);
		
	if(el.offsetWidth > this._mw) {
		this._mw = el.offsetWidth;
		this.optionsEl.style.width = (el.offsetWidth + 95) + 'px';
	}
	
	document.documentElement.removeChild(el);
		
	el.style.top = '0px';
	el.style.left = '0px';
	el.style.position = _pos;
};

MultiSelect.prototype._regChngFn = function() {
	if(!this._changeCb)
		return;
	
	this._changeCb.fn.call(this._changeCb.ctx, this._all, this._included, this._excluded, this._optionList);
};

MultiSelect.prototype.align = function(c) {
	if(c === 'left') {
		this.optionsEl.style.left = '0px';
		this.optionsEl.style.right = 'auto';
	}
	else if(c === 'right') {
		this.optionsEl.style.left = 'auto';
		this.optionsEl.style.right = '0px';
	}
	else {
		var prev = this.optionsEl.style.display;
		this.optionsEl.style.display = 'block';
		this.optionsEl.style.left = 'auto';
		this.optionsEl.style.right = Math.floor((this.ddEl.offsetWidth - this.optionsEl.offsetWidth)*0.5) + 'px';
		this.optionsEl.style.display = prev;
	}
};

MultiSelect.prototype.addAll = function() {
	this._all = {};
	
	this._all._ms = this;
	
	this._all.hol = document.createElement('div');
	this._all.chk = document.createElement('span');
	this._all.txt = document.createElement('span');
		
	this._all.hol.className = 'char_fil_hol';
	this._all.hol.style.textAlign = 'left';
		
	this._all.chk.innerHTML = '&nbsp;&#10004;&nbsp;';
	this._all.chk.className = 'char_fil_chk';
	this._all.chk.style.float = 'left';
	this._all.chk.style.marginLeft = '10px';
	this._all.chk.style.marginRight = '7px';
		
	this._all.txt.innerHTML = 'Select All';
			
	this._all.hol.appendChild(this._all.chk);
	this._all.hol.appendChild(this._all.txt);
		
	if(this._tp > 0) {
		this._all._ss = document.createElement('span');
		this._all._ss.innerHTML = '&nbsp;&nbsp;&nbsp;';
		this._all._ss.style.marginRight = '10px';
		
		this._all.hol.appendChild(this._all._ss);
	}
		
	this._findMaxWidth(this._all.hol);
	
	if(this._optionList.length > 0)
		this.optionsEl.appendChild(this._all.hol);
	else
		this.optionsEl.insertBefore(this._all.hol, this.optionsEl.getElementsByTagName('div')[0]);
		
	this._all.selected = false;
		
	this._all.select = function(_sup) {
		this.selected = true;
		this.hol.className = 'char_fil_tex_sel';
		this.chk.className = 'char_fil_bt';
			
		this._ms._unselectOptions();
			
		if(!_sup) {
			this._ms._chng = +Date.now();
		}
	};
		
	this._all.unselect = function(_sup) {
		this.selected = false;
		this.hol.className = 'char_fil_hol';
		this.chk.className = 'char_fil_chk';
			
		if(!_sup && _numSel === 0) {
			this._ms._chng = +Date.now();
		}
	};
	
	add_event(this._all.chk, 'click', this._allClick, this);

	this._all.select();
};
	
MultiSelect.prototype.add = function(v, t) {
	var _op = new Option(this, v, t);
		
	this._findMaxWidth(_op.hol);
		
	this.optionsEl.appendChild(_op.hol);
	this._optionList.push(_op);
};

MultiSelect.prototype.addChangeListener = function(f, ctx) {
	if(!f || !f instanceof Function) 
		return;
	
	this._changeCb = {fn: f, ctx: ctx};
	this._changeFn = this._regChngFn;
		
	this._chng = this._lastChng = +Date.now();
	this._changeFn();
};
	
var Fic = function(s) {
	if(!s || !s.className || !Fic.REGEX.zl.test(s.className))
		return;
		
	this._el = s;
	
	var _a = this._el.getElementsByClassName('stitle')[0];
	var im = _a.getElementsByTagName('img')[0];
	var aa = this._el.getElementsByTagName('a');
	var _s = this._el.getElementsByClassName('z-indent z-padtop')[0];
	var _d = _s.getElementsByClassName('z-padtop2 xgray')[0];
	var up = _d.getElementsByTagName('span');
	
	this.id = _a.href.match(Fic.REGEX.sd)[1];
	this.title = _a.innerText;
	
	for(var i=0; i<aa.length; ++i) {
		if(Fic.REGEX.uc.test(aa[i].href)) {
			this.author = aa[i].href.match(Fic.REGEX.ud)[1];
		}
	}
	
	this.summary = _s.innerHTML.replace(Fic.REGEX.dv, '');
	
	var str = _d.innerText;
	var m1 = str.match(Fic.REGEX.ch);
	var m2 = str.match(Fic.REGEX.wd);
	var m3 = str.match(Fic.REGEX.rv);
	var m4 = str.match(Fic.REGEX.fv);
	var m5 = str.match(Fic.REGEX.fl);
	
	this.data = {};
	this.data.chaps = m1 === null ? 0 : parseFloat(m1[1].replace(Fic.REGEX.cm, ''));
	this.data.words = m2 === null ? 0 : parseFloat(m2[1].replace(Fic.REGEX.cm, ''));
	this.data.revs = m3 === null ? 0 : parseFloat(m3[1].replace(Fic.REGEX.cm, ''));
	this.data.favs = m4 === null ? 0 : parseFloat(m4[1].replace(Fic.REGEX.cm, ''));
	this.data.folls = m5 === null ? 0 : parseFloat(m5[1].replace(Fic.REGEX.cm, ''));
	
	for(var i=0; i<up.length; ++i) {
		up[i].innerText = _date(up[i].dataset.xutime);
	}
	
	this.complete = Fic.REGEX.cp.test(str);
	str = str.replace(Fic.REGEX.cp, '');
	
	var m = str.match(Fic.REGEX.pb);
	this.chars = m === null? [] : m[1].replace(Fic.REGEX.br, '').replace(Fic.REGEX.cb, ',').split(', ');
	
	this.visible = true;
	
	this._img = im.cloneNode(true);
	this._img.className = '';
	this._img.dataset.original = '';
	_a.replaceChild(this._img, im);
	this._dd = _s;
	
	this.showImg = null;
	
	this._cc = -1;
	this._cr = -1;
	this._tt = -1;
	this._rcc = null;
	this._rcr = null;
	this._rtt = null;
};

Fic.REGEX = {
	sd: /\/s\/(\d+)\/.*/i,
	uc: /\/u\/.*/,
	ud: /\/u\/(\d+)\/.*/i,
	dv: /<div .*>.*<\/div>/,
	br: /\[|\](?=$)/g,
	cb: /\]/g,
	zl: /z-list/,
	ch: / Chapters: ([0-9,]+) /,
	wd: / Words: ([0-9,]+) /,
	rv: / Reviews: ([0-9,]+) /,
	fv: / Favs: ([0-9,]+) /,
	fl: / Follows: ([0-9,]+) /,
	cm: /,/g,
	cp: / - Complete$/,
	pb: / - Published: .* - (.+)$/
};

Fic.prototype.hide = function() {
	this.visible = false;
	this._el.style.display = 'none';
};

Fic.prototype.show = function(im) {
	this.visible = true;
	this.showImg = im;
	this._el.style.display = 'block';
	this._img.style.display = im ? 'block' : 'none';
	this._dd.style.paddingLeft = im ? '22px' : '3px';
};

var FicList = function(holder) {
	this.holder = holder;
	this.fics = [];
	this._stamp = -10;
	
	var ss = this.holder.getElementsByClassName('z-list');
	for(var i=0; i<ss.length; ++i) {
		this.fics.push(new Fic(ss[i]));
	}
	
	this._filter = null;
};

FicList.prototype.setFilter = function(f) {
	if(!f || !f instanceof Filter)
		return;
	
	this._filter = f;
};

FicList.prototype.filter = function() {
	if(!this._filter || this._filter.stamp === this._stamp)
		return;

	this._stamp = this._filter.stamp;
	
	for(var i=0; i<this.fics.length; ++i) {
		if(this._filter.filter(this.fics[i]))
			this.fics[i].hide();
		else if(!this.fics[i].visible || this.fics[i].showImg !== this._filter._img) {
			this.fics[i].show(this._filter._img);
		}
	}
};

var Page = function(head, page, url, next) {
	if(!head || !head instanceof Paginator)
		return;
	
	this._head = head;
	this._holder = this._head.story_holder;
	this._id = page;
	
	this._first = false;
	this._last = false;

	this.page = document.createElement('div');
	this.page.id = 'page_' + this._id;
	
	this.fics = null;
	
	if(next && next instanceof Page) {
		this._holder.insertBefore(this.page, next.page);
	}
	else {
		this._holder.appendChild(this.page);
	}
	
	if(!url) {
		var ss = this._head.parent.getElementsByClassName('z-list');
		
		for(var i=0; i<ss.length; ++i)
			this.page.appendChild(ss[i]);
		
		this.fics = new FicList(this.page);
		this.fics.setFilter(this._head._filter);
		this.fics.filter();
		
		this._head.status_text.className = 'status_load';
		this._head.status_text.innerHTML = '&nbsp;&nbsp;Loaded page <span class="page">&nbsp;' + this._id + '&nbsp;</span> of <span class="page">&nbsp;' + this._head.lastPage + '&nbsp;</span>.';
	}
	else if(typeof url === 'string') {
		this._url = url
		this._requestPage();
	}
};

Page.prototype._callback = function(h) {
	if(h.readyState === 4 && h.status === 200) {
		var __t = h.responseText.match(/(<div class='z-list(?:.|\n)*)<center/i)[1].replace(/<\/div>\n?<div id=fs.*/, '');
		
		this.page.innerHTML = __t;
		
		if(this._next) {
			this._holder.scrollTop += this.page.offsetHeight;
		}
		
		this.fics = new FicList(this.page);
		this.fics.setFilter(this._head._filter);
		this.fics.filter();
		
		this._head.status_text.className = 'status_load';
		this._head.status_text.innerHTML = '&nbsp;&nbsp;Loaded page <span class="page">&nbsp;' + this._id + '&nbsp;</span> of <span class="page">&nbsp;' + this._head.lastPage + '&nbsp;</span>.';
		
		this._head.evalPage(this._id);
	}
	else if(h.readyState === 4 && h.status !== 200) {
		this._requestPage();
	}
};

Page.prototype._requestPage = function() {
	var httpRequest = new XMLHttpRequest();
	httpRequest.open('GET', this._url);
	httpRequest.onreadystatechange = (function(ctx, cb) {
		return function() { cb.call(ctx, httpRequest); };
	})(this, this._callback);
	
	httpRequest.send();
};

Page.prototype.setFilter = function() {
	if(!this.fics)
		return;
	
	this.fics.setFilter(this._head._filter);
	this.fics.filter();
};

Page.prototype.filter = function() {
	if(!this.fics)
		return;
	
	this.fics.filter();
};

var Paginator = function() {
	this.dataType = null;
	this.location = null;
	
	this.initPage = 0;
	this.lastPage = 0;
	this.botPage = 0;
	
	this.pages = {};
	this.ranges = [];
	
	this._filter = null;
};

Paginator.prototype._processURL = function() {
	this.location = {};
	
	var l = document.location;
	var pn = l.href + (/\/$/.test(l.href) ? '' : '/');
	var cc = this.parent.getElementsByTagName('center');
	for(var i=0; i<cc.length; ++i) {
	    if(cc[i].getElementsByTagName('a').length > 0) {
		    cc = cc[i].getElementsByTagName('a');
			break;
		}
	}
	this.lastPage = null;
	if(this.dataType === 'n') {
		var m = pn.match(/\/\?&.*$/i);
		
		if(m === null) {
			this.location.pre = pn + '?&srt=1&r=103&p=';
			this.location.suf = '';
			
			this.initPage = 1;
		}
		else {
			this.location.pre = pn.replace(m[0], '') + m[0].replace(/&p=(\d+)/i, '') + '&p=';
			this.location.suf = '';
			
			var _t = m[0].match(/&p=(\d+)/i);
			
			this.initPage = _t === null ? 1 : parseInt(_t[1], 10);
		}
		
		for(var i=0; i<cc.length; ++i) {
			if(cc[i].innerHTML === 'Last') {
				this.lastPage = parseInt(cc[i].href.match(/&p=(\d+)/i)[1], 10);
			}
		}
		
		this.lastPage = this.lastPage === null || this.lastPage === 0 ? this.initPage : this.lastPage;
	}
	else if(this.dataType === 'c') {
		var m = pn.match(/\/\d+\/\d+\/\d+\/\d+\/\d+\/\d+\/\d+\/$/);
		
		if(m === null) {
			this.location.pre = pn + '3/0/';
			this.location.suf = '/0/0/0/0/';
			
			this.initPage = 1;
		}
		else {
			this.location.pre = pn.replace(m[0], '') + m[0].replace(/\d+\/\d+\/\d+\/\d+\/\d+\/$/, '');
			this.location.suf = m[0].replace(/^\/\d+\/\d+\/\d+/, '');
			
			this.initPage = parseInt(m[0].match(/^\/\d+\/\d+\/(\d+)/)[1]);
		}
		
		for(var i=0; i<cc.length; ++i) {
			if(cc[i].innerHTML === 'Last') {
				this.lastPage = parseInt(cc[i].href.match(/\/\d+\/\d+\/(\d+)\/\d+\/\d+\/\d+\/\d+\/$/)[1], 10);
			}
		}
		
		this.lastPage = this.lastPage === null  || this.lastPage === 0 ? this.initPage : this.lastPage;
	}
	else if(this.dataType === 's') {
		pn = pn.replace(/\/$/, '');
		var m = pn.match(/&ppage=(\d+)/i);
		
		if(m === null) {
			this.location.pre = pn + '&ppage=';
			this.location.suf = '';
			
			this.initPage = 1;
		}
		else {
			this.location.pre = pn.replace(m[0], '') + '&ppage=';
			this.location.suf = '';
			
			this.initPage = parseInt(m[1], 10);
		}
		
		for(var i=0; i<cc.length; ++i) {
			if(cc[i].innerHTML === 'Last') {
				this.lastPage = parseInt(cc[i].href.match(/&ppage=(\d+)/i)[1], 10);
			}
		}
		
		this.lastPage = this.lastPage === null ? this.initPage : this.lastPage;
	}
};

Paginator.prototype._initCharFilter = function() {
	var _h = document.createElement('div');
	var _hr = document.createElement('hr');
	
	var _s = document.createElement('span');
	
	this._charFilter = new MultiSelect('Select Characters', 1);
	
	_s.appendChild(this._charFilter.el);
	
	_hr.size = 1;
	_hr.noShade = true;
	
	_h.style.position = 'relative';
	_h.style.height = '22px';
	_h.style.lineHeight = '22px';
	
	_s.style.position = 'absolute';

	_h.appendChild(_s);

	this.status_holder.parentElement.insertBefore(_h, this.status_holder);
	this.status_holder.parentElement.insertBefore(_hr, this.status_holder);

	var _mp = this.location.pre.match(/&c\d=(\d+)/g);
	var _mn = this.location.pre.match(/&c_\d(\d+)/g);
	var _ci = [];
	
	if(_mp) {
		for(var i=0; i<_mp.length; ++i) {
			_ci.push(_mp[i].replace(/^&c\d=/, ''));
		}
	}
	
	if(_mn) {
		for(var i=0; i<_mn.length; ++i) {
			_ci.push(_mn[i].replace(/^&_c\d=/, ''));
		}
	}
	
	this._charFilter.addAll();
	
	var _f = document.getElementsByName('characterid1')[0].getElementsByTagName('option');
	
	for(var i=1; i<_f.length; ++i) {
		if(_ci.indexOf(_f[i].value) === -1) {
			this._charFilter.add(_f[i].text, _f[i].text);
		}
	}
	
	this._alignCharFilter = function() {
		_s.style.left = Math.floor((this.status_holder.offsetWidth - _s.offsetWidth)*0.5) + 'px';
		this._charFilter.align('center');
	};
	
	this._alignCharFilter();
	this._charFilter.addChangeListener(this._charFilterChange, this);
};

Paginator.prototype._charFilterChange = function(_a, _i, _e, _o) {
	this._filter.updateChars(_a, _i, _e, _o);
	
	this.filter();
};

Paginator.prototype._hidePages = function(i, j) {
	if(!Number(i) || !Number(j) || !this.pages[''+i] || !this.pages[''+j] || i > j)
		return;
	
	for(var k=i; k<=j; ++k)
		this.pages[''+k].page.style.visibility = 'hidden';
};

Paginator.prototype._checkTopEnter = function() {
	if(this.visTop <= 1)
		return;
		
	var t = this.pages[''+this.visTop].page.offsetTop;
	
	if(t < this.rangeTop) {
		return this._checkTopExit(t);
	}
	
	var i;
	for(i=this.visTop-1; i>=1; --i) {
		var p = this.pages[''+i];
		p.filter();
		if(p.page.offsetTop >= this.rangeTop) {
			p.page.style.visibility = 'visible';
		}
		else {
			p.page.style.visibility = 'hidden';
			break;
		}
	}
	
	this.visTop = i+1;
};

Paginator.prototype._checkBotEnter = function() {
	if(this.visBot >= this.lastPage)
		return;
	
	var b = this.pages[''+this.visBot].page.offsetTop;
	
	if(b >= this.rangeBot)
		return this._checkBotExit();

	var i;
	for(i=this.visBot+1; i<=this.lastPage; ++i) {
		var p = this.pages[''+i];
		if(!p)
			return this.addPage(i);
			
		p.filter();
		if(p.page.offsetTop < this.rangeBot) {
			p.page.style.visibility = 'visible';
		}
		else {
			p.page.style.visibility = 'hidden';
			break;
		}
	}
	
	this.visBot = i-1;
};

Paginator.prototype._checkTopExit = function() {
	if(this.visTop >= this.lastPage)
		return;
		
	var t = this.pages[''+this.visTop].page.offsetTop;
	
	if(t >= this.rangeTop)
		return this._checkTopEnter();
	
	this.pages[''+this.visTop].page.style.visibility = 'hidden';
	
	var i;
	for(i=this.visTop+1; i<=this.visBot; ++i) {
		var p = this.pages[''+i];
		if(p.page.offsetTop < this.rangeTop) {
			p.page.style.visibility = 'hidden';
		}
		else {
			p.page.style.visibility = 'visible';
			break;
		}
	}
	
	this.visTop = Math.min(i, this.botPage);
	
	if(this.visTop > this.visBot) {
		this.visBot = this.visTop;
		this._checkBotEnter();
	}
};

Paginator.prototype._checkBotExit = function() {
	if(this.visBot <= 1)
		return;
		
	var b = this.pages[''+this.visBot].page.offsetTop;
	
	if(b < this.rangeBot)
		return this._checkBotEnter();
	
	this.pages[''+this.visBot].page.style.visibility = 'hidden';
	
	var i;
	for(i=this.visBot-1; i>=1; --i) {
		var p = this.pages[''+i];
		if(p.page.offsetTop >= this.rangeBot) {
			p.page.style.visibility = 'hidden';
		}
		else {
			p.page.style.visibility = 'visible';
			break;
		}
	}
	
	this.visBot = Math.max(i, 1);
	
	if(this.visBot < this.visTop) {
		this.visTop = this.visBot;
		this._checkTopEnter();
	}
};

Paginator.prototype.testPagination = function() {
	var l = document.location;
	
	var r1 = /^\/(?:anime|book|cartoon|comic|game|misc|play|movie|tv|.+crossovers)\/.+/i,
		r2 = /^\/community\/.*/i,
		r3 = /\/search.php?.*&type=story.*/i;
	
	if(!r1.test(l.pathname) && !r2.test(l.pathname) && !r3.test(l.href))
		return false;
	
	if(r1.test(l.pathname)) {
		this.dataType = 'n';
	}
	else if(r2.test(l.pathname)) {
		this.dataType = 'c';
	}
	else {
		this.dataType = 's';
	}

	return true;
};

Paginator.prototype.addPage = function(pn) {
	if(this.adding || !Number(pn) || pn < 1 || pn > this.lastPage) {
		return;
	}
	
	this.botPage = pn;
	this.adding = true;
	
	this.status_text.className = 'status_check';
	this.status_text.innerHTML = '&nbsp;&nbsp;Checking page <span class="page">&nbsp;' + pn + '&nbsp;</span> of <span class="page">&nbsp;' + this.lastPage + '&nbsp;</span>...';
	
	if(this.pages[''+pn] && this.pages[''+pn].page.parentElement !== this.story_holder) {
		this.story_holder.appendChild(this.pages[''+pn].page);
		return this.evalPage(pn);
	}
	
	this.pages[''+pn] = new Page(this, pn, this.location.pre+''+pn+this.location.suf);
};

Paginator.prototype.evalPage = function(pn) {
	if(!Number(pn) || pn < 1 || pn > this.botPage)
		return;
	
	this.adding = false;

	if(this.pages[''+pn].page.offsetTop < this.rangeBot) {
		this.pages[''+pn].page.style.visibility = 'visible';
		this.visBot = pn;
		
		if(pn !== this.lastPage && !this.pages[''+(pn+1)])
			this.addPage(pn+1);
	}
	else {
		this.pages[''+pn].page.style.visibility = 'hidden';
	}
};

Paginator.prototype.scrollTest = function(e) {
	var dir = this.story_holder.scrollTop - this._lastScrollTop,
		dif = Math.abs(dir);
		
	this._lastScrollTop = this.story_holder.scrollTop;

	if(dif === 0)
		return;
	
	this.rangeTop = this._lastScrollTop - this._tOff;
	this.rangeBot = this._lastScrollTop + this._bOff;
	
	if(dir > 0) {
		this._checkTopExit();
		this._checkBotEnter();
	}
	else {
		this._checkBotExit();
		this._checkTopEnter();
	}
};

Paginator.prototype.setFilter = function(f) {
	if(!f || !f instanceof Filter)
		return;
	
	this._filter = f;

	for(var i in this.pages)
		this.pages[''+i].setFilter();
		
	if(this.dataType === 'n')
		this._initCharFilter();
};

Paginator.prototype.filter = function() {
	for(var i=this.visTop; i<=this.visBot; ++i) {
		var p = this.pages[''+i];
		p.filter();
		if(p.page.offsetTop >= this.rangeBot) {
			this._hidePages(i, this.visBot);
			this.visBot = i-1;
			return;
		}
	}
	
	this._checkTopEnter();
	this._checkBotEnter();
};

Paginator.prototype.enable = function() {
	this.parent = document.getElementById('content_wrapper_inner');
	var ss = this.parent.getElementsByClassName('z-list');
	
	this.story_holder = document.createElement('div');
	this.story_holder.id = 'story_holder';
	
	ss[0].parentElement.insertBefore(this.story_holder, ss[0]);
	
	this._processURL();
	
	this.story_holder.style.height = (Math.max(1000, window.innerHeight - this.story_holder.offsetTop)) + 'px';
	if(this.dataType !== 's')
		this.story_holder.style.width = (this.parent.offsetWidth - 10) + 'px';
	this.story_holder.style.overflowY = 'scroll';
	
	var cc = document.getElementsByTagName('center');
	for(var i=0; i<cc.length; ++i) {
		if(cc[i].getElementsByTagName('a').length > 0) 
			cc[i].style.display = 'none';
	}
	
	this.status_holder = document.createElement('div');
	
	this.status_text = document.createElement('div');
	this.status_text.id = 'status_text';
	
	var hr = document.createElement('hr');
	hr.size = 1;
	hr.noShade = true;
	
	this.status_holder.appendChild(this.status_text);
	this.status_holder.appendChild(hr);
	
	this.story_holder.parentElement.insertBefore(this.status_holder, this.story_holder);
	
	add_event(this.story_holder, 'scroll', this.scrollTest, this);
	
	this._tOff = Math.floor(3*this.story_holder.offsetHeight);
	this._bOff = Math.floor(4.5*this.story_holder.offsetHeight);
	
	this.rangeTop = this.story_holder.scrollTop - this._tOff;
	this.rangeBot = this.story_holder.scrollTop + this._bOff;
	
	this.rangeLength = this.rangeBot - this.rangeTop + 1;

	this._lastScrollTop = this.story_holder.scrollTop;
	
	this.pages[''+this.initPage] = new Page(this, this.initPage);
	
	this.visTop = this.visBot = 1;
	
	if(this.initPage !== 1) {
		this.story_holder.removeChild(this.pages[''+this.initPage].page);
		this.addPage(1);
	}
	else {
		this.evalPage(this.initPage);
	}
};

var Filter = function() {
	this._enable = null;
	this._crits = null;
	this._tags = null;
	this._chars = null;
	this._img = null;
	
	this.stamp = 1;
	
	this._ccStamp = 1;
	this._crStamp = 1;
	this._ttStamp = 1;
};

Filter.prototype._processCrit = function(c, d) {
	var v = c.value.split('/');
	for(var i=0; i<v.length; ++i)
		v[i] = d[v[i]];
	
	if(v.length > 1) {
		if(v[1] === 0)
			return false;
		v = v[0]/v[1];
	}
	else {
		v = v[0];
	}
		
	if(c.comp === '>')
		return v >= c.check;
	else if(c.comp === '<')
		return v <= c.check;
	else if(c.comp === '=')
		return v === c.check;
};

Filter.prototype._processTag = function(t, s) {
	return t.tp === 'p' ? (!t.re1.test(s) || t.re2.test(s)) : (t.re1.test(s) && !t.re2.test(s));
};

Filter.prototype._filterChars = function(c) {
	if(!this._chars)
		return false;
	
	var r = true;
	for(var i=0; i<c.length; ++i) {
		if(this._chars.exc.indexOf(c[i]) !== -1) {
			return true;
		}
		
		if(this._chars.inc.indexOf(c[i]) !== -1) {
			r = false;
		}
	}
	
	return this._chars.inc.length > 0 ? r : false;
};

Filter.prototype._filterTags = function(s) {
	if(!this._tags)
		return false;
		
	var c = null, r = true;
	for(var i in this._tags) {
		if(this._processTag(this._tags[i], s)) {
			if(this._tags[i].tp === 'n')
				return true;
			else
				c = true;
		}
		else if(this._tags[i].tp === 'p') {
			r = false;
		}
	}
	
	return c ? r : false;
};

Filter.prototype._filterCrits = function(d) {
	if(!this._crits)
		return false;
	
	for(var i=0; i<this._crits.length; ++i) {
		if(!this._processCrit(this._crits[i], d))
			return true;
	}
	
	return false;
};

Filter.prototype.updateChars = function(_a, _i, _e, _o) {
	this._chars = this._chars || {};
	
	if(_a && _a.selected) {
		this._chars.allSelected = true;
		this._chars.inc = [];
		this._chars.exc = [];
		
		++this.stamp;
		++this._ccStamp;
		return;
	}
	
	this._chars.allSelected = false;
	
	this._chars.inc = [];
	this._chars.exc = [];
	
	for(var i in _i) {
		if(_i[i]) 
			this._chars.inc.push(_o[parseInt(i, 10)].value);
	}
	
	for(var i in _e) {
		if(_e[i]) 
			this._chars.exc.push(_o[parseInt(i, 10)].value);
	}
	
	++this.stamp;
	++this._ccStamp;
};

Filter.prototype.updateCrits = function(c) {
	if(!c)
		return;
	
	this._crits = null;
	this._crits = c;
	
	++this.stamp;
	++this._crStamp;
};

Filter.prototype.updateTags = function(t) {
	if(!t)
		return;
	
	this._tags = null;
	this._tags = {};
	var o = this._tags;
	
	for(var i=0; i<t.length; i++) {
		var _t = t[i].tag;
		
		var p = _t.split('/');
		var ss = _t.split('!');
		var sp = _t.split(' ');
		
		var _tp = t[i].type;
		
		var s;
		
		if(p.length > 1) {
			s = p.join('');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = p.join(' ');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = p.join('\\s?x\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = p.join('\\s?\\/\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = p.join('\\s?!\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = p.join('\\s?-\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			
			p.reverse();
	
			s = p.join('');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = p.join(' ');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = p.join('\\s?x\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = p.join('\\s?\\/\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = p.join('\\s?!\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = p.join('\\s?-\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
		}
	
		if(ss.length > 1) {
			s = ss.join('');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = ss.join(' ');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = ss.join('\\s?x\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = ss.join('\\s?\\/\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = ss.join('\\s?!\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = ss.join('\\s?-\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
	
			ss.reverse();
	
			s = ss.join('');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = ss.join(' ');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = ss.join('\\s?x\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = ss.join('\\s?\\/\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = ss.join('\\s?!\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = ss.join('\\s?-\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
		}
	
		if(sp.length > 1) {
			s = sp.join('');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = sp.join(' ');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
			s = sp.join('\\s?-\\s?');
			o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
		}
	
		s = _t.replace(/\//g, '\\/');
		o[s] = o[s] || {re1: new RegExp(s, "i"), re2: new RegExp("(no|not|isn(\\')?t)\\s[^.,:;]{0,10}" + s, "i"), tp: _tp};
	}
	
	++this.stamp;
	++this._ttStamp;
	
	console.log(this._tags);
};

Filter.prototype.setImg = function(im) {
	this._img = im;
	++this.stamp;
};

Filter.prototype.enable = function(c, t, im) {
	this._enable = true;
	this.updateCrits(c);
	this.updateTags(t);
	this._img = im;
	++this.stamp;
};

Filter.prototype.disable = function() {
	this._enable = false;
	++this.stamp;
};

Filter.prototype.filter = function(s) {
	if(!this._enable || !s || !s instanceof Fic)
		return false;
	
	if(s._cc !== this._ccStamp) {
		s._cc = this._ccStamp;
		s._rcc = this._filterChars(s.chars);
	}
	if(s._cr !== this._crStamp) {
		s._cr = this._crStamp;
		s._rcr = this._filterCrits(s.data);
	}
	if(s._tt !== this._ttStamp) {
		s._tt = this._ttStamp;
		s._rtt = this._filterTags(s.title + ' - ' + s.summary);
	}
	
	return s._rcc || s._rcr || s._rtt;
};

//Time Code copied from FanFiction.Net::combol.js
var _month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function _date(f) {
    var e = _tms - f;
	var t = new Date(f*1000);
	var dd = t.getDate(), mm = t.getMonth(), yy = t.getFullYear();
    if (e < 60) {
        return 'secs ago';
    } else if (e <= 3600) {
        return Math.floor(e / 60) + 'm ago';
    } else if (e < 3600 * 24) {
        return Math.floor(e / 3600) + 'h ago';
    } else if (_timenow.year === yy) {
        return _month[mm] + ' ' + dd;
    } else {
        return _month[mm] + ' ' + dd + ', ' + yy;
    }
	
    return _month[dd] + ' ' + dd + ', ' + yy;
}
var _tms = Math.floor(Date.now()/1000), _timenow = new Date(_tms*1000);
//End Time Code from FanFiction.Net::combol.js

var _p = new Paginator();
var _f = new Filter();
var _inv = /^\/u\/.*|^\/~.+/.test(document.location.pathname);;

if(_p.testPagination()) {
	_p.enable();
	_inv = true;
} else if(_inv) {
	_p = null;
	_p = new FicList(document.getElementById('content_wrapper_inner'));
} else {
	_p = null;
}

var port = null;
var msg_listener = function(msg) {
	if(port === null || msg === null || !msg.str || !_inv)
		return;
	
	if(msg.str === 'enable') {
		_f.enable(msg.crits.slice(0), msg.tags.slice(0), msg.img);
		_p.filter();
	}
	else if(msg.str === 'disable') {
		_f.disable();
		_f.setImg(msg.img);
		_p.filter();
	}
	else if(msg.str === 'crits') {
		_f.updateCrits(msg.crits.slice(0));
		_p.filter();
	}
	else if(msg.str === 'tags') {
		_f.updateTags(msg.tags.slice(0));
		_p.filter();
	}
	else if(msg.str === 'img' && msg.img !== _f._img) {
		_f.setImg(msg.img);
		_p.filter();
	}
};

if(_inv) {
	window.addEventListener('resize', function() {
		if(!_p || !_p instanceof Paginator || !_inv)
			return;
	
		_p.story_holder.style.height = (Math.max(1000, window.innerHeight - _p.story_holder.offsetTop)) + 'px';
		if(_p.dataType !== 's')
			_p.story_holder.style.width = (_p.parent.offsetWidth - 10) + 'px';
		
		if(_p.alignCharFilter)
			_p._alignCharFilter();
		
		_p._checkTopEnter();
		_p._checkBotEnter();
	}, false);

	chrome.runtime.onConnect.addListener(function(p) {
		port = p;
		if(_inv)
			port.onMessage.addListener(msg_listener);
	});

	_p.setFilter(_f);
}

chrome.runtime.sendMessage({str: 'con_rqst', val: _inv});