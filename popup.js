LSEXT = {
	setToken: function(token, callback) {
		callback = callback ? callback : function() {};
		chrome.storage.local.set({ 'token': token }, function() {
			callback();
		});
	},
	getToken: function(callback) {
		callback = callback ? callback : function() {};
		chrome.storage.local.get({ 'token': '' }, function(items) {
			callback(items.token);
		});
	}
};

document.addEventListener('DOMContentLoaded', function(e) {
	var trigger = $('#logout');
	LSEXT.getToken(function(token) {
		if (token) {
			trigger.show();
			trigger.on('click', function(e) {
				e.preventDefault();
				LSEXT.setToken('');
				trigger.after('<p>Logged out!</p>');
				trigger.remove();
			});
		} else {
			trigger.after('<p>Logged out!</p>');
			trigger.hide();
		}
	});
});