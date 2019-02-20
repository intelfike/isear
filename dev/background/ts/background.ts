browser.tabs.onActivated.addListener(async function(activeInfo){
	// ==============================
	//  ハイライトを再度実行する
	// ==============================
	// 毎度実行するから重いかも？
	executeAllSequence(activeInfo.tabId, await getURL())

	// ==============================
	//  タブごとの設定を反映し直す
	// ==============================
	var swords = await storageGetWords()
	await storageSetWords(swords)

	// 設定を反映
	// コマンドモード
	var command_mode = await storageGet('command_mode')
	await executeCode('command_mode = ' + command_mode)
	// ブラックリスト用のテキストを更新
	var hl_mode = await hlGetSiteMode()
	var STRING = getSTRING()
	var hl_title = STRING['background']['TOGGLE_HIGHLIGHT_HERE'][''+hl_mode]
	chrome.contextMenus.update('hl_blacklist', {
		title: hl_title,
	})

	var hlbar_mode = await hlbarGetSiteMode()
	var hlbar_title = STRING['background']['TOGGLE_HIGHLIGHT_BAR_HERE'][''+hlbar_mode]
	chrome.contextMenus.update('hlbar_blacklist', {
		title: hlbar_title,
	})

	// TODO: ハイライトバーの制御を追加する
})

// ページが更新された時の処理
browser.tabs.onUpdated.addListener(async function(tabId:number, changeInfo, tab){
	if(changeInfo.status == 'complete'){
		executeAllSequence(tabId, tab.url)
		// 設定を反映
		var command_mode = await storageGet('command_mode')
		await executeCode('command_mode = ' + command_mode)
		return
	}
})
// ハイライトのためのすべての手順を実行する
async function executeAllSequence(tabId, url) {
	var injected = await executeCode('document.getElementById("isear-executed")')
	if (typeof injected == 'undefined' || !injected[0]) {
		await executeFile('inject.js')
		browser.tabs.insertCSS(null, {
			file: 'style.css',
		})
	}

	await saveGoogleSearchWords(tabId, url)
	await highlighting(tabId)
	browser.runtime.sendMessage({name: 'done highlight'})
}
async function highlighting(tabId:number){
	var swords:string = await storageGetWords()
	var words_nums = await executeHighlightAuto(swords)
}


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
