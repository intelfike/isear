chrome.tabs.onActivated.addListener(async function(){
	await executeFile('inject.js')
	var swords = await storageGetWords()
	await storageSetWords(swords)
})

chrome.tabs.onUpdated.addListener(async function(tabId:number, changeInfo, tab){
	var f = async ()=>{
		log('e')
		await executeFile('inject.js')
		await saveGoogleSearchWords(tabId, tab.url)
		await highlighting(tabId)
	}
	if(changeInfo.status == 'complete'){
		f()
		// whereTimeout(f, 200)
		return
	}
})
chrome.tabs.onRemoved.addListener(async function(tabId:number){
	storageRemove(saveWordsPrefix+tabId)
	storageRemove(saveNumPrefix+tabId)
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
		var q:string = url.match(/q=[^&]+/g)[0]
		q = q.substr(2)
		q = decodeURIComponent(q)

		var swords = q.split('+').join(' ')
		await storageSetWords(swords)
		ok()
	})
}
async function highlighting(tabId:number){
	var swords:string = await storageGetWords()
	var words_nums = await executeHighlightAuto(swords)
	await storageSet(saveNumPrefix+tabId, words_nums)
}


chrome.contextMenus.create({
	'title':'isear 検索ワードに追加',
	'contexts':['selection'],
	'onclick':async (clicked)=>{
		var text:string = clicked.selectionText
		if(/[\s\t　]/g.test(text)){
			text = text.replace(/[\s\t　]+/g, ' ')
			text = '"'+text+'"'
		}
		var swords:string = await storageGetWords()
		swords = swords + ' ' + text
		await storageSetWords(swords)
		await executeHighlightAuto(swords)
	}
})
