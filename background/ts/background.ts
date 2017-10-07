chrome.tabs.onActivated.addListener(async function(){
	var swords = await storageGetWords()
	await storageSetWords(swords)
})

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab){
	var f = async ()=>{
		await saveGoogleSearchWords(tabId, tab.url)
		highlighting(tab.url)
	}
	if(changeInfo.status == 'complete'){
		f()
		return
	}
	whereTimeout(f, 200)
})
chrome.tabs.onRemoved.addListener(async function(tabId: number){
	storageRemove(''+tabId)
})

// google検索ワードをストレージに保存する
function saveGoogleSearchWords(tabId, url){
	return new Promise(async ok => {
		if(url.indexOf('www.google') == -1){
			ok()
			return
		}
		if(!/[?&]q=/g.test(url)){
			ok()
			return
		}
		var q = url.match(/q=[^&]+/g)[0]
		q = q.substr(2)
		q = decodeURI(q)
		var swords = q.split('+').join(' ')
		await storageSetWords(swords)
		ok()
	})
}
async function highlighting(url){
	var swords = await storageGetWords()
	var words = wordsSplit(swords)
	await executeHighlightAuto(words)
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
		executeHighlightAuto(wordsSplit(swords))
	}
})
