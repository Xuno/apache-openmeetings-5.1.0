/*
 * jQuery CSSEmoticons plugin 0.2.9
 *
 * Copyright (c) 2010 Steve Schwartz (JangoSteve)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Date: Sun Oct 22 1:00:00 2010 -0500
 */
var CSSEmoticon = function() {
	const escapeCharacters = [")", "(", "*", "[", "]", "{", "}", "|", "^", "<", ">", "\\", "?", "+", "=", "."];
	const self = {
		emoticons: []
		, matchers: []
		, defaults: {animate: true, delay: 500, exclude: 'pre,code,.no-emoticons'}
		, emoticonize: function(str, options) {
			const opts = $.extend({}, this.defaults, options);

			let cssClass = 'css-emoticon';
			if (opts.animate) {
				cssClass += ' un-transformed-emoticon animated-emoticon';
			}
			for (let i = 0; i < this.matchers.length; ++i) {
				const m = this.matchers[i];
				const css = cssClass + " " + m.cssClass;
				str = str.replace(m.regexp, "$1<span class='" + css + "'>$2</span>");
			}
			return str;
		}
		, animate: function(options) {
			const opts = $.extend({}, this.defaults, options);
			// animate emoticons
			if (opts.animate) {
				setTimeout(function () {
					$('.un-transformed-emoticon').removeClass('un-transformed-emoticon');
				}, opts.delay);
			}
		}
	}

	const specialRegex = new RegExp('(\\' + escapeCharacters.join('|\\') + ')', 'g');
	// One of these characters must be present before the matched emoticon, or the matched emoticon must be the first character in the container HTML
	//  This is to ensure that the characters in the middle of HTML properties or URLs are not matched as emoticons
	//  Below matches ^ (first character in container HTML), \s (whitespace like space or tab), or \0 (NULL character)
	// (<\\S+.*>) matches <\\S+.*> (matches an HTML tag like <span> or <div>), but haven't quite gotten it working yet, need to push this fix now
	const preMatch = '(^|[\\s\\0])';

	function createMatcher(m) {
		const str = m.text.replace(specialRegex, '\\$1');
		m.regexp = new RegExp(preMatch + '(' + str + ')', 'g');
		return m;
	}
	function addMatchers(arr) {
		for (let i = 0; i < arr.length; ++i) {
			const o = arr[i]
			let m = typeof(o) === 'object' ? JSON.parse(JSON.stringify(o)) : {text: o, cssClass: ' '};
			self.emoticons.push(m.text);

			self.matchers.push(createMatcher(m));
			if (m.text.indexOf('=') > -1) {
				m = JSON.parse(JSON.stringify(m));
				m.text = m.text.replace(/=/g, '&#61;').replace(/[+]/g, '&#43;');
				self.matchers.push(createMatcher(m));
			}
			if (m.text.indexOf('\'') > -1) {
				m = JSON.parse(JSON.stringify(m));
				m.text = m.text.replace(/'/g, '&#39;');
				self.matchers.push(createMatcher(m));
			}
		}
	}
	addMatchers([
		":-)", ":o)", ":c)", ":^)", ":-D", ":-(", ":-9", ";-)", ":-P", ":-p", ":-Þ", ":-b", ":-O", ":-/", ":-X", ":-#", ":'(", "B-)", "8-)", ";*(", ":-*", ":-\\",
		"?-)" // <== This is my own invention, it's a smiling pirate (with an eye-patch)!
	]);
	addMatchers([ // separate these out so that we can add a letter-spacing between the characters for better proportions
		":)", ":]", "=]", "=)", "8)", ":}", ":D", ":(", ":[", ":{", "=(", ";)", ";]", ";D", ":P", ":p", "=P", "=p", ":b", ":Þ", ":O", ":/", "=/", ":S", ":#", ":X", "B)", ":|", ":\\", "=\\", ":*", ":&gt;", ":&lt;"
	]);
	addMatchers([ // emoticons to be treated with a special class, hash specifies the additional class to add, along with standard css-emoticon class
		{text: "&gt;:)", cssClass: "red-emoticon small-emoticon spaced-emoticon"},
		{text: "&gt;;)", cssClass: "red-emoticon small-emoticon spaced-emoticon"},
		{text: "&gt;:(", cssClass: "red-emoticon small-emoticon spaced-emoticon"},
		{text: "&gt;: )", cssClass: "red-emoticon small-emoticon"},
		{text: "&gt;; )", cssClass: "red-emoticon small-emoticon"},
		{text: "&gt;: (", cssClass: "red-emoticon small-emoticon"},
		{text: ";(", cssClass: "red-emoticon spaced-emoticon"},
		{text: "&lt;3", cssClass: "pink-emoticon counter-rotated"},
		{text: "O_O", cssClass: "no-rotate"},
		{text: "o_o", cssClass: "no-rotate"},
		{text: "0_o", cssClass: "no-rotate"},
		{text: "O_o", cssClass: "no-rotate"},
		{text: "T_T", cssClass: "no-rotate"},
		{text: "^_^", cssClass: "no-rotate"},
		{text: "O:)", cssClass: "small-emoticon spaced-emoticon"},
		{text: "O: )", cssClass: "small-emoticon"},
		{text: "8D", cssClass: "small-emoticon spaced-emoticon"},
		{text: "XD", cssClass: "small-emoticon spaced-emoticon"},
		{text: "xD", cssClass: "small-emoticon spaced-emoticon"},
		{text: "=D", cssClass: "small-emoticon spaced-emoticon"},
		{text: "8O", cssClass: "small-emoticon spaced-emoticon"},
		{text: "[+=..]", cssClass: "no-rotate nintendo-controller"}
	]);
	return self;
};
/* Licensed under the Apache License, Version 2.0 (the "License") http://www.apache.org/licenses/LICENSE-2.0 */
var Chat = function() {
	const msgIdPrefix = 'chat-msg-id-'
		, closedSize = 20
		, closedSizePx = closedSize + "px"
		, emoticon = new CSSEmoticon()
		, doneTypingInterval = 5000 //time in ms, 5 second for example
		, SEND_ENTER = 'enter', SEND_CTRL = 'ctrl'
		, audio = new Audio('./public/chat_message.mp3')
		;
	let p, ctrlBlk, tabs, openedHeight = "345px", openedWidth = "500px", allPrefix = "All"
		, roomPrefix = "Room ", typingTimer, roomMode = false
		, editor = $('#chatMessage .wysiwyg-editor'), muted = false, sendOn, DEF_SEND
		, userId, inited = false, newMsgNotification
		;
	let userscolor = new Object();

	function __setCssVar(key, _val) {
		const val = ('' + _val).endsWith('px') ? _val : _val + 'px';
		if (roomMode) {
			if (typeof(Room) == 'object' && typeof(Room.setCssVar) === 'function') {
				Room.setCssVar(key, val);
			}
		} else {
			OmUtil.setCssVar(key, val);
		}
	}
	function __setCssWidth(val) {
		__setCssVar('--chat-width', val)
	}
	function __setCssHeight(val) {
		__setCssVar('--chat-height', val)
	}
	function _load() {
		const s = Settings.load();
		if (typeof(s.chat) === 'undefined') {
			s.chat = {
				muted: false
				, sendOn: DEF_SEND
			};
		}
		muted = s.chat.muted === true;
		sendOn = s.chat.sendOn === SEND_ENTER ? SEND_ENTER : SEND_CTRL;
		return s;
	}
	function _updateAudioBtn(btn) {
		btn.removeClass('sound' + (muted ? '' : '-mute')).addClass('sound' + (muted ? '-mute' : ''))
				.attr('title', btn.data(muted ? 'sound-enabled' : 'sound-muted'));
	}
	function _updateSendBtn(btn) {
		const ctrl = sendOn === SEND_CTRL;
		if (ctrl) {
			btn.addClass('send-ctrl');
			editor.off('keydown', _sendOnEnter).keydown('Ctrl+return', _sendOnEnter);
		} else {
			btn.removeClass('send-ctrl');
			editor.off('keydown', _sendOnEnter).keydown('return', _sendOnEnter);
		}
		btn.attr('title', btn.data(ctrl ? 'send-ctrl' : 'send-enter'));
	}
	function _sendOnEnter() {
		$('#chat .send').trigger('click');
	}
	function doneTyping () {
		typingTimer = null;
		chatActivity('typing_stop', $('.room-block .room-container').data('room-id'));
	}
	function _emtClick() {
		_editorAppend($(this).data('emt'));
	}
	function initToolbar() {
		const emots = emoticon.emoticons;
		const rowSize = 20, emotMenuList = $('#emotMenuList');
		emotMenuList.html('');
		let row;
		for (let i = 0; i < emots.length; ++i) {
			if (i % rowSize === 0) {
				row = $('<tr></tr>');
				emotMenuList.append(row);
			}
			row.append($('<td>').append(
					$('<div>').addClass('emt').html(emoticon.emoticonize(emots[i]))
						.data('emt', emots[i]).click(_emtClick)
				));
		}
		const emtBtn = $('#emoticons');
		emtBtn.html('');
		emtBtn.append(' ' + emoticon.emoticonize(':)'));
		const a = $('#chat .audio');
		const sbtn = $('#chat .send-btn');
		{ //scope
			_load();
			_updateAudioBtn(a);
			_updateSendBtn(sbtn)
		}
		a.off().click(function() {
			const s = _load();
			muted = s.chat.muted = !s.chat.muted;
			_updateAudioBtn(a);
			Settings.save(s);
		});
		sbtn.off().click(function() {
			const s = _load();
			sendOn = s.chat.sendOn = s.chat.sendOn !== SEND_CTRL ? SEND_CTRL : SEND_ENTER;
			_updateSendBtn(sbtn);
			Settings.save(s);
		});
		$('#chat #hyperlink').parent().find('button').off().click(function() {
			_insertLink();
		});
		emoticon.animate();
	}
	function isClosed() {
		return p.hasClass('closed');
	}
        function isWide() {
        	return p.hasClass('wide');
        }
	function activateTab(id) {
		if (isClosed() || isWide()) {
			tabs.find('.nav.nav-tabs .nav-link').each(function() {
				const self = $(this)
					, tabId = self.attr('aria-controls')
					, tab = $('#' + tabId);

				if (tabId === id) {
					self.addClass('active');
					tab.addClass('active');
					self.attr('aria-selected', true);
				} else {
					self.removeClass('active');
					tab.removeClass('active');
					self.attr('aria-selected', false);
				}
			});
		} else {
			$('#chatTabs li a[aria-controls="' + id + '"]').tab('show');
		}
		$('#activeChatTab').val(id).trigger('change');
	}
	function _reinit(opts) {
		userId = opts.userId;
		allPrefix = opts.all;
		roomPrefix = opts.room;
		DEF_SEND = opts.sendOnEnter === true ? SEND_ENTER : SEND_CTRL;
		sendOn = DEF_SEND;
		p = $('#chatPanel');
		clearTimeout(p.data('timeout'));
		ctrlBlk = $('#chatPopup .control.block');
		newMsgNotification = ctrlBlk.data('new-msg');
		editor = $('#chatMessage .wysiwyg-editor');
		initToolbar();
		tabs = $("#chatTabs");
		tabs.off().on('shown.bs.tab', function (e) {
			const ct = $(e.target).attr('aria-controls');
			_scrollDown($('#' + ct));
			$('#activeChatTab').val(ct).trigger('change');
		});
		tabs.delegate(".btn.close-chat", "click", function() {
			const panelId = $(this).closest("a").attr("aria-controls");
			_removeTab(panelId);
			$('#chatTabs li:last-child a').tab('show');
		});
		if (roomMode) {
			_removeResize();
		} else {
			ctrlBlk.attr('title', '');
			p.removeClass('room opened').addClass('closed')
				.off('mouseenter mouseleave')
				.resizable({
					handles: 'n, ' + (Settings.isRtl ? 'e' : 'w')
					, disabled: isClosed()
					, minHeight: 195
					, minWidth: 260
					, stop: function(_, ui) {
						p.css({'top': '', 'left': ''});
						openedHeight = ui.size.height + 'px';
						__setCssHeight(openedHeight);
						__setCssWidth(ui.size.width);
					}
				});
			__setCssHeight(closedSize);
		}
		ctrlBlk.off().click(Chat.toggle);
		$('#chatMessage').off().on('input propertychange paste', function () {
			const room = $('.room-block .room-container');
			if (room.length) {
				if (!!typingTimer) {
					clearTimeout(typingTimer);
				} else {
					chatActivity('typing_start', room.data('room-id'));
				}
				typingTimer = setTimeout(doneTyping, doneTypingInterval);
			}
		});
		$('#chat .chat-toolbar .link-field').off().on('keypress', function() {
			if (event.keyCode === 13) {
				$(this).parent().find('button').trigger('click');
			}
			return event.keyCode !== 13;
		});
		inited = true;
	}
	function _removeTab(id) {
		$('#chatTabs li a[aria-controls="' + id + '"]').parent().remove();
		$('#' + id).remove();
	}
	function _addTab(id, label) {
		if (!inited) {
			_reinit({});
		}
		if ($('#chat').length < 1 || $('#' + id).length) {
			return;
		}
		if (!label) {
			label = id === "chatTab-all" ? allPrefix : roomPrefix + id.substr(9);
		}
		const link = $('<a class="nav-link" data-toggle="tab" role="tab">')
			.attr('aria-controls', id)
			.attr('href', '#' + id).text(label)
			, li = $('<li class="nav-item">').append(link);
		if (id.indexOf("chatTab-u") === 0) {
			link.append(OmUtil.tmpl('#chat-close-block'));
		}
		tabs.find('.nav.nav-tabs').append(li);
		const msgArea = OmUtil.tmpl('#chat-msg-area-template', id);
		tabs.find('.tab-content').append(msgArea);
		msgArea.append($('<div class="clear icons actions align-left">').addClass('short')
				.append(OmUtil.tmpl('#chat-actions-short-template')));
		msgArea.append($('<div class="clear icons actions align-left">').addClass('short-mod')
				.append(OmUtil.tmpl('#chat-actions-short-template'))
				.append(OmUtil.tmpl('#chat-actions-accept-template')));
		msgArea.append($('<div class="clear icons actions align-left">').addClass('full')
				.append(OmUtil.tmpl('#chat-actions-short-template'))
				.append(OmUtil.tmpl('#chat-actions-others-template').children().clone()));
		msgArea.append($('<div class="clear icons actions align-left">').addClass('full-mod')
				.append(OmUtil.tmpl('#chat-actions-short-template'))
				.append(OmUtil.tmpl('#chat-actions-others-template').children().clone())
				.append(OmUtil.tmpl('#chat-actions-accept-template')));
		const actions = __hideActions();
		actions.find('.user').off().click(function() {
			const e = $(this).parent();
			showUserInfo(e.data("userId"));
		});
		actions.find('.add').off().click(function() {
			const e = $(this).parent();
			addContact(e.data("userId"));
		});
		actions.find('.new-email').off().click(function() {
			const e = $(this).parent();
			privateMessage(e.data("userId"));
		});
		actions.find('.invite').off().click(function() {
			const e = $(this).parent();
			inviteUser(e.data("userId"));
		});
		actions.find('.accept').off().click(function() {
			const e = $(this).parent()
				, msgId = e.data('msgId');
			chatActivity('accept', e.data('roomId'), msgId);
			__hideActions();
			$('#chat-msg-id-' + msgId).remove();
		});
		activateTab(id);
	}
	function __hideActions() {
		return $('#chat .tab-content .messageArea .icons').hide();
	}
	function __getActions(row) {
		return row.closest('.messageArea').find('.actions.' + row.data('actions'));
	}
	function _addMessage(m) {
		if ($('#chat').length > 0 && m && m.type === "chat") {
			let msg, cm, notify = false;
			while (!!(cm = m.msg.pop())) {
				let area = $('#' + cm.scope);
				if (cm.from.id !== userId && (isClosed() || !area.is(':visible'))) {
					notify = true;
				}
				const actions = ('full' === cm.actions ? 'full' : 'short') + (cm.needModeration ? '-mod' : '');
				msg = OmUtil.tmpl('#chat-msg-template', msgIdPrefix + cm.id)
				const row = msg.find('.user-row')
					.data('userId', cm.from.id)
					.data('actions', actions)
					.mouseenter(function() {
						__hideActions();
						__getActions($(this))
							.data('userId', $(this).data('userId'))
							.data('roomId', $(this).data('roomId'))
							.data('msgId', $(this).data('msgId'))
							.css('top', ($(this).closest('.msg-row')[0].offsetTop + 20) + 'px')
							.show();
					});
				if (userscolor[cm.from.id]==undefined) {
				    let ue=Object.keys(userscolor).length;
				    let hc=10+ue*50; 
				    if (hc > 360) {
				     hc=10+Math.floor(Math.random()*350); 
				    }
				    userscolor[cm.from.id]='hsl('+ hc +',25%,90%)';
				    console.log(userscolor[cm.from.id]);
				}
				row.parent()[0].style.backgroundColor=userscolor[cm.from.id];
				if (cm.needModeration) {
					row.parent().addClass('need-moderation');
					row.data('roomId', cm.scope.substring(9))
						.data('msgId', cm.id);
				}
				area.mouseleave(function() {
					__hideActions();
				});
				msg.find('.from').data('user-id', cm.from.id).html(cm.from.displayName || cm.from.name);
				msg.find('.time').html(cm.time).attr('title', cm.sent);
				if (!area.length) {
					_addTab(cm.scope, cm.scopeName);
					area = $('#' + cm.scope);
				}
				if (m.mode === "accept") {
					$('#chat-msg-id-' + cm.id).remove();
				}
				const btm = area[0].scrollHeight - (area.scrollTop() + area.innerHeight()) < 3; //approximately equal
				if (area.data('lastDate') !== cm.date) {
					area.append(OmUtil.tmpl('#chat-date-template').html(cm.date).mouseenter(function() {
						__hideActions();
					}));
					area.data('lastDate', cm.date);
				}
				area.append(msg);
				msg.find('.user-row')[0].style.backgroundImage = 'url(' + (!!cm.from.img ? cm.from.img : './profile/' + cm.from.id + '?anticache=' + Date.now()) + ')';

				msg.find('.msg').html(emoticon.emoticonize(!!cm.message ? cm.message : ""));
				if (btm) {
					_scrollDown(area);
				}
			}
			if (notify) {
				ctrlBlk.addClass('bg-warning');
				if (p.is(':visible') && !muted) {
					if (window === window.parent) {
						function _newMessage() {
							new Notification(newMsgNotification, {
								tag: 'new_chat_msg'
							});
						        audio.play()
							.then(function() {
								// Automatic playback started!
							}).catch(function() {
								// Automatic playback failed.
							});

						}
						if (Notification.permission === 'granted') {
							_newMessage();
						} else if (Notification.permission !== 'denied') {
							Notification.requestPermission().then(permission => {
								if (permission === 'granted') {
									_newMessage();
								}
							});
						}
					} else {
						// impossible to use Notification API from iFrame
						audio.play()
							.then(function() {
								// Automatic playback started!
							}).catch(function() {
								// Automatic playback failed.
							});
					}
				}
			}
			emoticon.animate();
		}
	}
	function _setOpened() {
		__setCssWidth(openedWidth);
		p.resizable({
			handles: (Settings.isRtl ? 'e' : 'w')
			, minWidth: 165
			, stop: function(_, ui) {
				p.css({'left': '', 'width': '', 'height': ''});
				openedWidth = ui.size.width + 'px';
				__setCssWidth(openedWidth);
			}
		});
	}
	function _setOpenedw() {
		__setCssWidth(innerWidth);
		p.addClass('wide').css({'height': '', 'width': ''});
		p.resizable({
		    handles: (Settings.isRtl ? 'e' : 'w')
		    , minWidth: 120
		    , stop: function(event, ui) {
			p.css({'left': '', 'width': '', 'height': ''});
			openedWidth = ui.size.width + 'px';
			__setCssWidth(openedWidth);
		    }
		});
	}
	function _removeResize() {
		if (p.resizable('instance') !== undefined) {
			p.resizable('destroy');
		}
	}
        function _openw(handler) {
        	if (!isClosed() && !isWide()) {
        	    //ctrlBlk.removeClass('bg-warning');
        	    let opts;
        	    if (roomMode) {
        		opts = {width: innerWidth};
        	    } else {
        		opts = {height: openedHeight};
        		p.resizable("option", "disabled", false);
        	    }
        	    p.removeClass('closed').animate(opts, 1000, function() {
        		__hideActions();
        		p.removeClass('closed');
        		p.css({'height': '', 'width': ''});
        		if (typeof(handler) === 'function') {
        		    handler();
        		}
        		ctrlBlk.attr('title', ctrlBlk.data('ttl-undock'));
        		if (roomMode) {
        		    _setOpenedw();
        		} else {
        		    __setCssHeight(openedHeight);
        		}
        		_setAreaHeight();
        	    });
        	}
        }
	function _open(handler) {
		if (isClosed()) {
			ctrlBlk.removeClass('bg-warning');
			let opts;
			if (roomMode) {
				opts = {width: openedWidth};
			} else {
				opts = {height: openedHeight};
				p.resizable("option", "disabled", false);
			}
			p.removeClass('closed').animate(opts, 1000, function() {
				__hideActions();
				p.removeClass('closed');
				p.css({'height': '', 'width': ''});
				if (typeof(handler) === 'function') {
					handler();
				}
				ctrlBlk.attr('title', ctrlBlk.data('ttl-exdock'));
				if (roomMode) {
					_setOpened();
				} else {
					__setCssHeight(openedHeight);
				}
				_setAreaHeight();
			});
		}
	}
	function _close(handler) {
		if (!isClosed()) {
			let opts;
			if (roomMode) {
				opts = {width: closedSizePx};
			} else {
				opts = {height: closedSizePx};
				p.resizable("option", "disabled", true);
			}
			p.animate(opts, 1000, function() {
				p.addClass('closed').css({'height': '', 'width': ''});
				p.removeClass('wide');
				if (roomMode) {
					__setCssWidth(closedSizePx);
					_removeResize();
				} else {
					__setCssHeight(closedSizePx);
				}
				if (typeof(handler) === 'function') {
					handler();
				}
				ctrlBlk.attr('title', ctrlBlk.data('ttl-dock'));
			});
		}
	}
	function _toggle() {
		if (isClosed()) {
			_open();
		} else if (isWide()) {
			_close();
	        } else {
			_openw();
		}
	}
	function _editorAppend(_emoticon) {
		editor.html(editor.html() + ' ' + _emoticon + ' ').trigger('change');
	}
	function _clean() {
		editor.html('').trigger('change');
	}
	function _setRoomMode(_mode) {
		roomMode = _mode;
		if (inited && !roomMode) {
			// remove all private chats on room exit
			$('li[aria-controls^="chatTab-u"]').remove();
			$('div[id^="chatTab-u"]').remove();
		}
		_reinit({userId: userId, all: allPrefix, room: roomPrefix, sendOnEnter: sendOn === SEND_ENTER});
	}
	function _scrollDown(area) {
		area.animate({
			scrollTop: area[0].scrollHeight
		}, 300);
	}
	function _setAreaHeight() {
		$('#chat .messageArea').each(function() {
			_scrollDown($(this));
		});
	}
	function _insertLink() {
		const text = $('#chat #hyperlink').parent().find('input').val();
		if ('' === text) {
			return;
		}
		let url = text.trim();
		if ('' === url) {
			return;
		}
		if (!/^(https?:)?\/\//i.test(url)) {
			url = 'http://' + url;
		}
		const a = $('<div>').append($('<a></a>').attr('target', '_blank').attr('href', url).text(url)).html();
		if (window.getSelection) {
			const sel = window.getSelection();
			if (sel.rangeCount) {
				const range = sel.getRangeAt(0);
				if ($(range.startContainer).parents('.wysiwyg-editor').length > 0) {
					range.deleteContents();
					range.insertNode(a);
				} else {
					_editorAppend(a);
				}
			}
		}
	}
	return {
		reinit: _reinit
		, removeTab: _removeTab
		, addTab: _addTab
		, addMessage: _addMessage
		, open: _open
		, setOpened: function() {
			_open(function() {
				_setOpened();
			});
		}
		, close: _close
		, toggle: _toggle
		, setRoomMode: _setRoomMode
		, clean: _clean
		, validate: function() {
			return !!editor && editor.text().trim().length > 0;
		}
	};
}();
$(function() {
	Wicket.Event.subscribe("/websocket/message", function(_, msg) {
		try {
			if (msg instanceof Blob) {
				return; //ping
			}
			const m = JSON.parse(msg);
			if (m) {
				switch(m.type) {
					case "chat":
						if ('clean' === m.action) {
							$('#' + m.scope).html('');
						} else {
							Chat.addMessage(m);
						}
						break;
					case "typing":
						if (typeof(typingActivity) === "function") {
							typingActivity(m.uid, m.active);
						}
						break;
				}
			}
		} catch (err) {
			//no-op
		}
	});
});
