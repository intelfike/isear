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
		var swords = q.split('+').join(' ')
		await storageSetWords(swords)
		ok()
	})
}
async function highlighting(url){
	var swords = await storageGetWords()
	// ページ遷移によってデータが失われないように
	await storageSetWords(swords)
	words = wordsSplit(swords)
	await executeHighlight(words)
}


chrome.contextMenus.create({
	'title':'isear 検索ワードに追加',
	'contexts':['selection'],
	'onclick':async (clicked)=>{
		var text = clicked.selectionText
		if(/[\s\t　]/g.test(text)){
			text = text.replace(/[\s\t　]+/g, ' ')
			text = '"'+text+'"'
		}
		var swords = await storageGetWords()
		swords = swords + ' ' + text
		await storageSetWords(swords)
		executeHighlight(wordsSplit(swords))
	}
})
