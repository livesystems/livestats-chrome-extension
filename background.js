LSEXT = {};

// get token at start
chrome.storage.local.get({
	token: ''
}, function (items) {
	LSEXT.token = items.token;
});

// update token when changed
chrome.storage.onChanged.addListener(function(changes, areaName) {
	if (changes && changes.token) {
		LSEXT.token = changes.token.newValue;
	}
});

// set the token on each request
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
		if (LSEXT.token) {
			details.requestHeaders.push({
				'name': 'Token',
				'value': LSEXT.token
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
