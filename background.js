var search_words_obj = document.getElementById('search_words')

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab){
	if(changeInfo.status != 'complete'){
		return
	}
	await saveGoogleSearchWords(tab.url)
	highlighting(tab.url)
})

function saveGoogleSearchWords(url){
	return new Promise(async ok => {
		if(url.indexOf('www.google') == -1){
			ok()
			return
		}
		if(!/[?&]q=/g.test(url)){
			ok()
			return
		}
		q = url.match(/q=[^&]+/g)[0]
		q = q.substr(2)
		q = decodeURI(q)
		words = q.split('+').join(' ')
		var data = {}
		data[url] = words
		var autosave = await storageGet('autosave')['autosave']
		if(autosave != undefined && autosave == true){
			await storageSet(url, words)
		}
		await storageSet('value', words)
		ok()
	})
}
async function highlighting(url){
	var words = await storageGetWords()
	words = wordsSplit(words)
	await executeHighlight(words)
}


chrome.contextMenus.create({
	'title':'isear 検索ワードとして追加',
	'contexts':['selection'],
	'onclick':(clicked)=>{
		var text = clicked.selectionText
		alert(text + ':この機能はまだ未実装です(*^_^*)/')
	}
})
