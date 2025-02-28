async function popup_unload() {
	// ポップアップが閉じたときのイベント
	var enabled:boolean = await getEnabled()
	var ph:boolean = await storageGet('popup_highlight', false, true)
	console.log('popup_unload', enabled, ph)
	if (enabled && ph) {
		// ポップアップ時のみハイライト
		await storageSet('popup_highlight_close', true)
		await extensionEnable(false)
		await highlighting(tabId)
	}
}
// async function popup_kanshi() {
// 	while (true) {.
// 		let popupOpen = await storageGet('popupOpen', false)
// 		if (popupOpen) {
// 			storageSet('popupOpen', false)
// 		} else {
// 			await popup_unload()
// 		}
// 		await sleep(500)
// 	}
// }
// popup_kanshi()

// // ポップアップからのメッセージを受信する
// browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   if (request.action === "popupClosed") {
//     // ポップアップが閉じられた際の処理
//     console.log("ポップアップが閉じられました。");
//     // ここで実行したい処理を記述
//   }
// });

var tabId;
browser.tabs.onActivated.addListener(async function(activeInfo){
	let url = await getURL()
	if (/^chrome:\/\//.test(url)) {
		return
	}
	// アイコン反映
	autoSetIcon()
	// ==============================
	//  ハイライトを再度実行する
	// ==============================
	// 毎度実行するから重いかも？
	tabId = activeInfo.tabId
	executeAllSequence(tabId, url)

	// ==============================
	//  タブごとの設定を反映し直す
	// ==============================
	var enb:boolean = await getEnabled() // 直前の拡張機能の状態を取得
	await storageSet('enabled', enb) // 最後のハイライト状態を維持するよう、現在の状態を記録

	var swords = await storageGetWords()
	await storageSetWords(swords)

	// 設定を反映
	// コマンドモード
	var command_mode = await storageGet('command_mode', false)
	await executeFunc((_command_mode) => {command_mode = _command_mode}, [command_mode], tabId)
	// ブラックリスト用のテキストを更新
	var hl_mode = await hlGetSiteMode()
	var STRING = getSTRING()
	var hl_title = STRING['background']['TOGGLE_HIGHLIGHT_HERE'][''+hl_mode]
	browser.contextMenus.update('hl_blacklist', {
		title: hl_title,
	})

	var hlbar_mode = await hlbarGetSiteMode()
	var hlbar_title = STRING['background']['TOGGLE_HIGHLIGHT_BAR_HERE'][''+hlbar_mode]
	// browser.contextMenus.update('hlbar_blacklist', {
	// 	title: hlbar_title,
	// })
})

browser.tabs.onCreated.addListener(async function(tabId:number){
	// もとのタブの設定をコピーする
	var enb:boolean = await storageGet('enabled', true) // 直前の拡張機能の状態を取得
	console.log(enb)
	extensionEnable(enb) // 最後のハイライト状態を維持するよう、現在の状態を記録
})
// ページが更新された時の処理
browser.tabs.onUpdated.addListener(async function(tabId:number, changeInfo, tab){
	if(changeInfo.status == 'complete'){
		executeAllSequence(tabId, tab.url)
		// 設定を反映
		var command_mode = await storageGet('command_mode', false)
		await executeFunc((_command_mode) => {command_mode = _command_mode}, [command_mode], tabId)
		return
	}
})
browser.tabs.onRemoved.addListener(async function(tabId:number){
	storageRemove(saveWordsPrefix+tabId)
	storageRemove(saveNumPrefix+tabId)
})

// ハイライトのためのすべての手順を実行する
async function executeAllSequence(tabId, url) {
	var enb:boolean = true


	// ハイライトのブラックリストを適用
	var curURL = await getURL()
	var list = await storageGet('hl_blacklist', {}, true)
	for (const reg in list) {
		if (new RegExp(reg).test(curURL)) {
			enb = list[reg] && enb // 基本falseを代入
		}
	}
	if (!enb) {
		return
	}

	var injected = await executeFunc(() => {
		if (document.getElementById("isear-executed")) {
			return true
		}
		return false
	}, [], tabId)
	if (!injected) {
		await executeFile('inject.js', tabId)
		browser.scripting.insertCSS({
		   target: { tabId: tabId },
		   files: ["style.css"],
		})
	}

	await saveGoogleSearchWords(tabId, url)

	// popup時にハイライトする場合、実行しない
	var ph:boolean = await storageGet('popup_highlight', false, true)
	if (ph) {
		return
	}

	await highlighting(tabId)
	browser.runtime.sendMessage({name: 'done highlight'}).catch((error)=> {
		// エラー処理
	})
}
async function highlighting(tabId:number){
	var swords:string = await storageGetWords()
	var words_nums = await executeHighlightAuto(swords, tabId)
}
async function kill_highlighting(tabId:number){
	var swords:string = await storageGetWords()
	var words_nums = await executeHighlight(swords, false, tabId)
}

// google検索ワードをストレージに保存する
function saveGoogleSearchWords(tabId, url){
	return new Promise(async ok => {
		try {
			var gw = await storageGet('google_words', true, true)
			if(!gw){
				ok(null)
				return
			}
			if(url.indexOf('www.google') == -1){
				ok(null)
				return
			}
			if(!/[?&]q=/g.test(url)){
				ok(null)
				return
			}
			var q:string = url.match(/q=[^&#]+/g)[0]
			q = q.substr(2)
			q = decodeURIComponent(q)

			var swords = q.split('+').join(' ')
			await storageSetWords(swords, true, tabId)
			ok(null)
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}
