// trueで拡張機能を有効にする
async function extensionEnable(enb:boolean){
	return new Promise(async ok => {
		try {
			await storageSet('enabled', enb)
			let tabId = await getTabId();

			// // タブごとに有効記録
			// let enabled_tab_list = await storageGet('enabled_tab_list', {})
			// enabled_tab_list[tabId] = enb
			// await storageSet('enabled_tab_list', enabled_tab_list)
			// // ホストごとに有効記録
			// let enabled_host_list = await storageGet('enabled_host_list', {}, true)
			// let host = ''
			// try {
			// 	let url = await getURL()
			// 	if (url) {
			// 		host = new URL(url).host
			// 	}
			// } catch (e) {}
			// enabled_host_list[host] = enb
			// await storageSet('enabled_host_list', enabled_host_list, true)

			var swords:string = await storageGetWords()
			// console.log(enb)
			await executeHighlight(swords, enb, tabId)
			// console.log('test')
			autoSetIcon()
			// console.log('test2')
			ok(null)
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}
// 有効かどうか取得する
function getEnabled():Promise<boolean>{
	return new Promise(async ok=>{
		try {
			let host = ''
			try {
				let url = await getURL()
				if (url) {
					host = new URL(url).host
				}
			} catch (e) {}

			// youtubeは無効
			if (/youtube\.com/.test(host)) {
				ok(false)
				return
			}
			var enb:boolean = await storageGet('enabled', true)
			// var enabled:boolean = true
			// let enabled_tab_list = await storageGet('enabled_tab_list', {})
			// let tabId = await getTabId();
			// if (tabId in enabled_tab_list) {
			// 	enabled = enabled_tab_list[tabId]
			// } else {
			// 	// ホストごとに有効判定
			// 	let enabled_host_list = await storageGet('enabled_host_list', {}, true)
			// 	if (host in enabled_host_list) {
			// 		enabled = enabled_host_list[host]
			// 	}
			// }

			ok(enb)
		} catch (e) {
			console.log(e)
			ok(true)
		}
	})
}

// swordは原文を渡す
function executeHighlightAuto(swords:string, tabId:number=null){
	return new Promise(async ok=>{
		try {
			// var enb:boolean = await storageGet('enabled', true)

			// ホストごとに有効判定
			var enb:boolean = await getEnabled()

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
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}
// boolはfalseならハイライトをオフ	
function executeHighlight(swords:string, enabled=true, tabId:number=null){
	return new Promise(async ok=>{
		try {
			autoSetIcon()

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
			browser.contextMenus.update('clear', {
				title: clear_text,
			})
			ok(null)
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}

function changeURL(url:string){
	browser.tabs.update(null, {
		url:url
	})
}

function getURL():Promise<string>{
	return new Promise((ok, reject) => {
		try {
			browser.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
				if(tabs.length == 0){
					ok('')
					return
				}
				var url = tabs[0].url;
				ok(url)
			})
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}

function getSite():Promise<string>{
	return new Promise(async ok => {
		try {
			var url = await getURL()
			var site = url.match(/https?:\/\/[^/]+\//g)[0]
			ok(site)
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}

function getTabId(): Promise<number>{
	return new Promise((ok, reject) => {
		try {
			browser.tabs.query({currentWindow: true, active: true}, (tab)=>{
				if (tab && tab[0]) {
					ok(tab[0].id)
				} else {
					reject(null)
				}
			})
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}
function storageSet(key:string, value:any, sync:boolean=false){
	return new Promise(async ok => {
		try {
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
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}
function storageGet(key:string, def:any=undefined, sync:boolean=false):Promise<any>{
	return new Promise(async ok => {
		try {
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
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}
function storageRemove(key:string){
	return new Promise(ok =>{
		try {
			browser.storage.local.remove(key, ok)
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}
// wordsには文字列を渡してね
// saveLatestにすると、新規タブを開いたときにそのワードが表示されるようになるよ
function storageSetWords(words:string, saveLatest:boolean=false, tabId:number=undefined){
	return new Promise(async ok => {
		try {
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
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}
// 保存された検索ワードをテキストボックスに自動入力
function storageGetWords():Promise<string> {
	return new Promise(async ok => {
		try {
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
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}
// ログを保存する
function setLog(words:string) {
	return new Promise(async ok => {
		try {
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
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}
function getLogs():Promise<string[]> {
	return new Promise(async ok => {
		try {
			var logs = await storageGet('words_logs', [])
			var logs_current = await storageGet('words_logs_current', 0)
			logs = logs.slice(logs_current+1).concat(logs.slice(0, logs_current+1))
			logs = logs.reverse()
			ok(logs)
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}
function clearLogs() {
	return new Promise(async ok => {
		try {
			await storageRemove('words_logs')
			await storageRemove('words_logs_current')
			ok(null)
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})	
}
function getLogsEnabled():Promise<boolean>{
	return new Promise(async ok => {
		try {
			var logs_enable = await storageGet('words_logs_enabled', false, true)
			ok(logs_enable)
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}

function storageSetNum(words_nums:{[key:string]:number;}){
	return new Promise(async ok => {
		try {
			var tabId = await getTabId()
			await storageSet(saveNumPrefix+tabId, words_nums)
			ok(null)
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}
function storageGetNum():Promise<{[key:string]:number;}>{
	return new Promise(async ok => {
		try {
			var tabId = await getTabId()
			var words_nums:{[key:string]:number;} = await storageGet(saveNumPrefix+tabId)
			ok(words_nums)
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}

function getBgColor():Promise<string[]> {
	return new Promise(async ok => {
		try {
		let colset = await storageGet('color-set', 'normal', true)
		bgColors = color_sets[colset]
		if (colset == 'custom') {
			bgColors = await storageGet('bgColors', bgColors, true)
		}
		ok(bgColors)
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}

function executeFile(file:string, tabId:number=null):any{
	return new Promise(async ok => {
		try {
			if (typeof browser.scripting == 'undefined') {
				ok(null)
			}
			let result = await browser.scripting.executeScript({
				// target: {tabId: tabId, allFrames: true},
				target: {tabId: tabId},
				files: [file],
			})
			if (result && result.length && 0 in result && typeof result[0].result !== 'undefined') {
				ok(result[0].result)
			}
			ok(null)
		} catch (e) {
			console.log(e)
			ok(null)
		}
		ok(null)
	})
}
function executeFunc(func:(...any) => any, args:any[] = [], tabId:number=null):any{
	return new Promise(async ok => {
		try {
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
				if (result && result.length && 0 in result && typeof result[0].result !== 'undefined') {
					ok(result[0].result)
				}
			} else {
				let result = await browser.scripting.executeScript({
					// target: {tabId: tabId, allFrames: true},
					target: {tabId: tabId},
					func: func,
				})
				if (result && result.length && 0 in result && typeof result[0].result !== 'undefined') {
					ok(result[0].result)
				}
			}
			ok(null)
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}

// エラー出るけど問題ない
async function toggleEnable():Promise<boolean>{
	return new Promise(async ok => {
		try {
			var bool:boolean = await getEnabled()
			bool = !bool
			extensionEnable(bool)
			ok(bool)
		} catch (e) {
			console.log(e)
			ok(null)
		}
	})
}



function setIcon(icon:string){
	if (typeof browser.action == 'undefined') {
		return
	}
	if (browser.action.hasOwnProperty('setIcon')) {
		browser.action.setIcon({path:icon})
	}
}

async function autoSetIcon(){
	var icon = 'data/icons/icon32.png'

	var command_mode = await storageGet('command_mode', false)
	if(command_mode){
		icon = 'data/icons/icon32command.png'
	}
	// var enabled = await storageGet('enabled', false)
	// ホストごとに有効判定
	var enb:boolean = await getEnabled()

	if(!enb){
		icon = 'data/icons/icon32grey.png'
	}
	setIcon(icon)
}

function sendMessage(name:string, message:string='') {
	browser.runtime.sendMessage({ name: name, message: message })
}

function onMessage(name:string, callback:(message: string) => void) {
	browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
		if(request.name == name){
			callback(request.message)
		}
	})
}
