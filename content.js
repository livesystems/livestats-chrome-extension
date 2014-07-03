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

jQuery(document).ready(function($) {
	var fingerprint = new Fingerprint().get();
	var loading = false;
	var loginTriggerText = 'Login with this browser';
	var logoutTriggerText = 'Log this browser out';
	var loginTrigger = $('<a href="#" class="btn btn-default">'+loginTriggerText+'</a>');
	var logoutTrigger = $('<a href="#" class="btn btn-default">'+logoutTriggerText+'</a>');
	var form = $('form.form-login');
	var formLogin = form.find('.btn-primary');
	var loginError = $('#login-error');
	var next = form.find('input[name="next"]').val();
	if (!next) { next = '/'; }

	LSEXT.getToken(function(token) {
		if (token) {
			// show logout button
			formLogin.after(logoutTrigger);
			bindLogoutAction();
		} else {
			// show login button
			formLogin.after(loginTrigger);
			bindLoginAction();
		}
	});

	function bindLogoutAction() {
		logoutTrigger.on('click', function(e) {
			e.preventDefault();
			if (!loading) {
				loading = true;
				logoutTrigger.html('<span class="loader"></span>');
				LSEXT.setToken('', function() {
					logoutTrigger.html('Logged out!');
					setTimeout(function() {
						loading = false;
						logoutTrigger.after(loginTrigger);
						bindLoginAction();
						logoutTrigger.remove();
					}, 1000);
				});
			}
		});
	}

	function bindLoginAction() {
		loginTrigger.on('click', function(e) {
			e.preventDefault();
			if (!loading) {
				loading = true;
				loginTrigger.html('<span class="loader"></span>');
				var postData = {
					username: form.find('input[name="username"]').val(),
					password: form.find('input[name="password"]').val(),
					device_name: 'Browser',
					device_type: 'browser',
					device_id: fingerprint
				};
				$.ajax({
					type: "POST",
					url: '/api/v2/devices/',
					dataType: 'json',
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(postData),
					success: function(resp) {
						LSEXT.setToken(resp.token, function() {
							if (resp.token) {
								window.location = next;
							} else {
								loginTrigger.html('Sorry, something went wrong.');
							}
						});
					},
					error: function(e) {
						loading = false;
						loginTrigger.html(loginTriggerText);
						loginError.show();
					}
				});
			}
		});
	}
});