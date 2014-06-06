EXT = {};

// get token at start
chrome.storage.local.get({
	token: ''
}, function (items) {
	EXT.token = items.token;
});

// update token when changed
chrome.storage.onChanged.addListener(function(changes, areaName) {
	if (changes && changes.token) {
		EXT.token = changes.token.newValue;
	}
});

// set token function
function setToken(token, callback) {
	chrome.storage.local.set({ 'token': token }, function() {
		callback();
	});
}

// set the token on each request
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
		if (EXT.token) {
			details.requestHeaders.push({
				'name': 'Token',
				'value': EXT.token
			});
		}
		return { requestHeaders: details.requestHeaders };
	},
	{ urls: ["https://cloud.livesystems.info/*", "http://localhost:8000/*"] },
	["blocking", "requestHeaders"]
);

// check if we should show the page action
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (tab.url && (tab.url.indexOf('https://cloud.livesystems.info') != -1 || tab.url.indexOf('http://localhost:8000') != -1)) {
		chrome.pageAction.show(tabId);
	} else {
		chrome.pageAction.hide(tabId);
	}
});

// listen for connections from the web
chrome.runtime.onConnectExternal.addListener(function(port) {
	if (EXT.token) {
		port.postMessage({ canLogout: 'canLogout' });
	} else {
		port.postMessage({ canLogin: 'canLogin' });
	}
	port.onMessage.addListener(function(message) {
		if (message.token) {
			setToken(message.token, function() {
				port.postMessage({ saved: 'saved' });
			});
		} else if (message.logout) {
			setToken('', function() {
				port.postMessage({ logoutDone: 'logoutDone' });
			})
		}
	});
});