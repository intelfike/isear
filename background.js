var search_words_obj = document.getElementById('search_words')

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if(changeInfo.status != 'complete'){
		return
	}
	if(tab.url.indexOf('www.google') == -1){
		return
	}
	if(!/[?&]q=/g.test(tab.url)){
		return
	}
	q = tab.url.match(/q=[^&]+/g)[0]
	q = q.substr(2)
	words = q.split('+').join(' ')
	var data = {}
	data[tab.url] = words
	chrome.storage.local.set(data)
})
