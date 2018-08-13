var _bg = chrome.extension.getBackgroundPage();

var gear = document.getElementById('gear');
var set = document.getElementById('set');
var config = document.getElementById('config');
var disBox = document.getElementById('disBox');
var imgBox = document.getElementById('imgBox');
var neg = document.getElementById('neg');
var pos = document.getElementById('pos');
var c_add = document.getElementById('c_add');
var holder = document.getElementById('holder');
var show = document.getElementById('show_ins');
var inst_box = document.getElementById('inst_box');
var tag_enter = document.getElementById('tag_enter');
var tags = document.getElementById('tags');
var animTimeout, animation;

var showAnimation = function() {
	animation.complete = Math.min(1, animation.complete+animation.step);
	
	gear.parentElement.style.width = (animation.complete*245) + 'px';
	
	if(animation.complete !== 1) {
			animTimeout = window.setTimeout(showAnimation, 16);
	}
	else {
		animation.animating = false;
		animTimeout = null;
	}
};

var hideAnimation = function() {
	animation.complete = Math.max(0, animation.complete-animation.step);
	
	gear.parentElement.style.width = (animation.complete*245) + 'px';
	
	if(animation.complete !== 0) {
			animTimeout = window.setTimeout(hideAnimation, 16);
	}
	else {
		animation.animating = false;
		animTimeout = null;
		gear.parentElement.className = '';
	}
};

_bg._crits.populate(holder);
_bg._tags.populate(tags);

disBox.checked = !_bg.config.enabled;
imgBox.checked = _bg.config.img;

animTimeout = null;
animation = { animating: false, complete: 0, step: 0.05 };

if(_bg.config.conf) {
	animation.complete = 1;
	gear.parentElement.className = 'show_set';
	gear.parentElement.style.width = '245px';
	config.style.display = 'block';
}


if(_bg.config.def === 'n') {
	neg.checked = true;
	pos.checked = false;
}
else {
	neg.checked = false;
	pos.checked = true;
}

if(_bg.config.inst) {
	show.innerText = '[Hide Instructions]';
	inst_box.style.display = 'block';
}
else {
	show.innerText = '[Show Instructions]';
	inst_box.style.display = 'none';
}

gear.parentElement.addEventListener('mouseenter', function(e) {
	if(animTimeout) {
		window.clearTimeout(animTimeout);
	}
	gear.parentElement.className = 'show_set';
	gear.parentElement.style.width = (animation.complete*245) + 'px';
	
	animation.animating = true;
	
	animTimeout = window.setTimeout(showAnimation, 16);
});

gear.parentElement.addEventListener('mouseleave', function(e) {
	if(e.relatedTarget === set || e.relatedTarget === gear || _bg.config.conf)
		return;
	
	if(animTimeout) {
		window.clearTimeout(animTimeout);
	}
	
	animation.animating = true;
	
	animTimeout = window.setTimeout(hideAnimation, 16);
});

gear.parentElement.addEventListener('click', function() {
	if(_bg.config.conf) {
		config.style.display = 'none';
		_bg.config.conf = false;
	}
	else {
		config.style.display = 'block';
		_bg.config.conf = true;
	}
	
	_bg.saveConfig();
}, false);

disBox.addEventListener('change', function(e) {
	_bg.config.enabled = (e.target.checked === false);
	_bg.toggleEnable(_bg.config.enabled);
}, false);

imgBox.addEventListener('change', function(e) {
	_bg.config.img = e.target.checked;
	_bg.sendImg();
	_bg.saveConfig();
}, false);

neg.addEventListener('change', function(e) {
	if(e.target.checked) {
		_bg.config.def = 'n';
		_bg.saveConfig();
	}
}, false);

pos.addEventListener('change', function(e) {
	if(e.target.checked) {
		_bg.config.def = 'p';
		_bg.saveConfig();
	}
}, false);

c_add.addEventListener('click', function(e) {
	_bg._crits.addCrit();
}, false);

tag_enter.addEventListener('focus', function(e) {
	tag_enter.value = '';
}, false);

tag_enter.addEventListener('blur', function(e) {
	tag_enter.value = 'Enter Filter Tag';
}, false);

tag_enter.addEventListener('keyup', function(e) {
	var k = e.which ? e.which : e.keyCode;
	
	if(k === 13 && tag_enter.value !== '') {
		if(tag_enter.value && typeof tag_enter.value === 'string') {
			_bg._tags.addTag(tag_enter.value);
		}
		
		tag_enter.value = '';
	}
	
}, false);

show.addEventListener('click', function(e) {
	_bg.config.inst = !_bg.config.inst;
	if(_bg.config.inst) {
		show.innerText = '[Hide Instructions]';
		inst_box.style.display = 'block';
	}
	else {
		show.innerText = '[Show Instructions]';
		inst_box.style.display = 'none';
	}
	_bg.saveConfig();
}, false);