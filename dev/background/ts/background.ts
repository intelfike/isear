autoSetIcon()

// タブ移動で最新の検索ワードを記録する為
browser.tabs.onActivated.addListener(async function(){
	var swords = await storageGetWords()
	await storageSetWords(swords)

	// 設定を反映
	var command_mode = await storageGet('command_mode')
	await executeCode('command_mode = ' + command_mode)
})

// ページが更新された時の処理
browser.tabs.onUpdated.addListener(async function(tabId:number, changeInfo, tab){
	var f = async ()=>{
		await executeFile('inject.js')
		browser.tabs.insertCSS(null, {
			code: '#itel-selected, #isear-top-selected{background-color:red !important; color:white !important;}\n' +
			'#isear-top-selected{border-color:white !important; z-index:9999999998 !important;}'
		})

		await saveGoogleSearchWords(tabId, tab.url)
		await highlighting(tabId)
		browser.runtime.sendMessage({name: 'done highlight'})
	}
	if(changeInfo.status == 'complete'){
		f()
		// 設定を反映
		var command_mode = await storageGet('command_mode')
		await executeCode('command_mode = ' + command_mode)
		return
	}
})
browser.tabs.onRemoved.addListener(async function(tabId:number){
	storageRemove(saveWordsPrefix+tabId)
	storageRemove(saveNumPrefix+tabId)
})

// google検索ワードをストレージに保存する
function saveGoogleSearchWords(tabId, url){
	return new Promise(async ok => {
		var gw = await storageGet('google_words', true, true)
		if(!gw){
			ok()
			return
		}
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
}
