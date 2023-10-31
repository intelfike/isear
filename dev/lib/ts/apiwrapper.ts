
// swordは原文を渡す
function executeHighlightAuto(swords:string, tabId:number=null){
	return new Promise(async ok=>{
		var enb:boolean = await storageGet('enabled', true)

		// ハイライトのブラックリストを適用
		var curURL = await getURL()
		var list = await storageGet('hl_blacklist', {}, true)
		for (const reg in list) {
			if (new RegExp(reg).test(curURL)) {
				enb = list[reg] && enb // 基本falseを代入
			}
		}
		await executeHighlight(swords, enb, tabId)
		ok(null)
	})
}
// boolはfalseならハイライトをオフ	
function executeHighlight(swords:string, enabled=true, tabId:number=null){
	return new Promise(async ok=>{
		// ページに値を渡す処理
		bgColors = await getBgColor()

		await executeFunc((_bgColors) => {bgColors = _bgColors}, [bgColors], tabId)
		await executeFunc((_browser_type) => {browser_type = _browser_type}, [browser_type], tabId)
		var au = await storageGet('auto_update', false, true)
		await executeFunc((_auto_update) => {auto_update = _auto_update}, [au], tabId)
		var regbool = await storageGet('regbool', false, true)
		await executeFunc((_regbool) => {regbool = _regbool}, [regbool], tabId)

		var enbar = await storageGet('enabled_bar', true, true)
		var curURL = await getURL()
		// ハイライトバーのブラックリストを適用
		var blist = await storageGet('hlbar_blacklist', {}, true)
		for (const reg in blist) {
			if (new RegExp(reg).test(curURL)) {
				enbar = blist[reg] // 基本falseを代入
			}
		}
		await executeFunc((_enabled_bar) => {enabled_bar = _enabled_bar}, [enbar], tabId)

		// ハイライトバーの初期状態を設定
		var showBars = await storageGet('bar-visible', true, true)
		// var showBars = await globalStorage.getItem('bar-visible')
		await executeFunc((_showBars) => {showBars = _showBars}, [showBars], tabId)

		// ハイライトを実行
		var result = await executeFunc((swords,enabled) => {
			if (typeof itel_main !== "undefined") {
				return itel_main(swords,enabled)
			} else {
				console.log('Browser extention "isear" is disabled.')
			}
		}, [swords,enabled], tabId)
		if (typeof result == 'undefined') {
			return
		}
		// 検索件数を保存
		await storageSetNum(<{[key:string]:number;}>result)

		// コンテキスト クリアテキストを変更
		var STRING = getSTRING()
		var clear_text = STRING['background']['CLEAR_WORDS'][''+(swords!='')]
		chrome.contextMenus.update('clear', {
			title: clear_text,
		})
		ok(null)
	})
}

function changeURL(url:string){
	browser.tabs.update(null, {
		url:url
	})
}

function getURL():Promise<string>{
	return new Promise((ok, reject) => {
		browser.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
			if(tabs.length == 0){
				ok('')
				return
			}
			var url = tabs[0].url;
			ok(url)
		})
	})
}

function getSite():Promise<string>{
	return new Promise(async ok => {
		var url = await getURL()
		var site = url.match(/https?:\/\/[^/]+\//g)[0]
		ok(site)
	})
}

function getTabId(): Promise<number>{
	return new Promise((ok, reject) => {
		browser.tabs.query({currentWindow: true, active: true}, (tab)=>{
			if (tab && tab[0]) {
				ok(tab[0].id)
			} else {
				reject(null)
			}
		})
	})
}
function storageSet(key:string, value:any, sync:boolean=false){
	return new Promise(async ok => {
		var data = {}
		data[''+key] = value

		var st = browser.storage.local
		var sync_enabled = await storageGet('sync', false)
		if(sync && sync_enabled){
			st = browser.storage.sync
		}
		try{
			await st.set(data, ok)
		}catch(e){
			await browser.storage.local.set(data, ok)
		}
	})
}
function storageGet(key:string, def:any=undefined, sync:boolean=false):Promise<any>{
	return new Promise(async ok => {
		var st = browser.storage.local
		if(sync){
			var sync_enabled = await storageGet('sync', false) // 再帰呼び出し
			if(sync_enabled){
				st = browser.storage.sync
			}
		}
		var callback = function(value){
			if(value == undefined || !(key in value)){
				ok(def)
				return
			}
			ok(value[key])
		}
		try{
			await st.get(key, callback)
		}catch(e){
			await browser.storage.local.get(key, callback)
		}
	})
}
function storageRemove(key:string){
	return new Promise(ok =>{
		browser.storage.local.remove(key, ok)
	})
}
// wordsには文字列を渡してね
// saveLatestにすると、新規タブを開いたときにそのワードが表示されるようになるよ
function storageSetWords(words:string, saveLatest:boolean=false, tabId:number=undefined){
	return new Promise(async ok => {
		if (typeof tabId == 'undefined') {
			tabId = await getTabId()
		}
		await storageSet(saveWordsPrefix+tabId, words)
		if (saveLatest) {
			await storageSet(latest_words, words)
			// ログをつける
			await setLog(words)
		}
		ok(null)
	})
}
// 保存された検索ワードをテキストボックスに自動入力
function storageGetWords():Promise<string> {
	return new Promise(async ok => {
		var tabId = await getTabId()
		var swords:string = await storageGet(saveWordsPrefix+tabId, undefined)
		if(swords == undefined){
			swords = await storageGet(latest_words, undefined)
		}
		if(swords != undefined){
			swords = swords.trim()
			// 接頭文字をつける
			var tt = await storageGet('template-type', 'add', true)
			if (tt == 'always') {
				var pf = await storageGet('prefix', '', true)
				if(swords.indexOf(pf) != 0){
					swords = pf + ' ' + swords
				}
			}
		}

		ok(swords)
	})
}
// ログを保存する
function setLog(words:string) {
	return new Promise(async ok => {
		var logs = await storageGet('words_logs', [])
		var logs_current = await storageGet('words_logs_current', -1)
		var logs_max = await storageGet('words_logs_max', 100)
		logs_current++
		logs_current %= logs_max
		logs[logs_current] = words
		// console.log(logs, logs_current)
		await storageSet('words_logs', logs)
		await storageSet('words_logs_current', logs_current)
		ok(null)
	})
}
function getLogs():Promise<string[]> {
	return new Promise(async ok => {
		var logs = await storageGet('words_logs', [])
		var logs_current = await storageGet('words_logs_current', 0)
		logs = logs.slice(logs_current+1).concat(logs.slice(0, logs_current+1))
		logs = logs.reverse()
		ok(logs)
	})
}
function clearLogs() {
	return new Promise(async ok => {
		await storageRemove('words_logs')
		await storageRemove('words_logs_current')
		ok(null)
	})	
}
function getLogsEnabled():Promise<boolean>{
	return new Promise(async ok => {
		var logs_enable = await storageGet('words_logs_enabled', false, true)
		ok(logs_enable)
	})
}

function storageSetNum(words_nums:{[key:string]:number;}){
	return new Promise(async ok => {
		var tabId = await getTabId()
		await storageSet(saveNumPrefix+tabId, words_nums)
		ok(null)
	})
}
function storageGetNum():Promise<{[key:string]:number;}>{
	return new Promise(async ok => {
		var tabId = await getTabId()
		var words_nums:{[key:string]:number;} = await storageGet(saveNumPrefix+tabId)
		ok(words_nums)
	})
}

function getBgColor():Promise<string[]> {
	return new Promise(async ok => {
		let colset = await storageGet('color-set', 'normal', true)
		bgColors = color_sets[colset]
		if (colset == 'custom') {
			bgColors = await storageGet('bgColors', bgColors, true)
		}
		ok(bgColors)
	})
}

function executeFile(file:string, tabId:number=null):any{
	return new Promise(async ok => {
		if (typeof browser.scripting == 'undefined') {
			ok(null)
		}
		let result = await browser.scripting.executeScript({
			// target: {tabId: tabId, allFrames: true},
			target: {tabId: tabId},
			files: [file],
		})
		ok(result)
	})
}
function executeFunc(func:(...any) => any, args:any[] = [], tabId:number=null):any{
	return new Promise(async ok => {
		if (typeof browser.scripting == 'undefined') {
			ok(null)
		}
		// console.log(func, args, tabId)
		if (args && args.length) {
			let result = await browser.scripting.executeScript({
				// target: {tabId: tabId, allFrames: true},
				target: {tabId: tabId},
				func: func,
				args: args,
			})
			ok(result[0].result)
		} else {
			let result = await browser.scripting.executeScript({
				// target: {tabId: tabId, allFrames: true},
				target: {tabId: tabId},
				func: func,
			})
			ok(result[0].result)
		}
	})
}

// エラー出るけど問題ない
async function toggleEnable():Promise<boolean>{
	return new Promise(async ok => {
		var bool:boolean = await storageGet('enabled', true)
		bool = !bool
		extensionEnable(bool)
		ok(bool)
	})
}

// trueで拡張機能を有効にする
async function extensionEnable(bool:boolean){
	return new Promise(async ok => {
		await storageSet('enabled', bool)
		var swords:string = await storageGetWords()
		let tabId = await getTabId()
		await executeHighlight(swords, bool, tabId)
		autoSetIcon()
		ok(null)
	})
}



function setIcon(icon:string){
	if (typeof chrome.browserAction == 'undefined') {
		return
	}
	if (chrome.browserAction.hasOwnProperty('setIcon')) {
		chrome.browserAction.setIcon({path:icon})
	}
}

async function autoSetIcon(){
	var icon = 'data/icons/icon32.png'

	var command_mode = await storageGet('command_mode', false)
	if(command_mode){
		icon = 'data/icons/icon32command.png'
	}
	var enabled = await storageGet('enabled', false)
	if(!enabled){
		icon = 'data/icons/icon32grey.png'
	}
	setIcon(icon)
}