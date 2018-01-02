
// swordは原文を渡す
function executeHighlightAuto(swords:string):Promise<{[key:string]:number;}>{
	return new Promise(async ok=>{
		var enb:boolean = await storageGet('enabled')
		if(enb == undefined){
			enb = true
		}
		var result:{[key:string]:number;} = await executeHighlight(swords, enb)
		ok(result)
	})
}
// boolはfalseならハイライトをオフ
function executeHighlight(swords:string, bool=true):Promise<{[key:string]:number;}>{
	return new Promise(async ok=>{
		// ページに値を渡す処理
		bgColors = await storageGet('bgColors', bgColors, true)
		await executeCode('bgColors = ' + JSON.stringify(bgColors))
		await executeCode('browser_type = ' + JSON.stringify(browser_type))
		var au = await storageGet('auto_update', false, true)
		await executeCode('auto_update = ' + JSON.stringify(au))
		var enbar = await storageGet('enabled_bar', true, true)
		await executeCode('enabled_bar = ' + JSON.stringify(enbar))
		var regbool = await storageGet('regbool', false, true)
		await executeCode('regbool = ' + JSON.stringify(regbool))

		// 引数を作成して
		var shbar = await storageGet('show_bar', true, true)
		await executeCode('showBars = ' + JSON.stringify(shbar))
		// ハイライトを実行
		var result = await executeCode('itel_main('+JSON.stringify(swords)+', '+bool+')')
		await executeCode('itel_inject_flag = true')
		ok(<Promise<{[key:string]:number;}>> result[0])
	})
}

function inject(code: string){
	browser.tabs.executeScript(null,
		{code:code}
	)
}
function log(mess:any){
	inject("console.log("+JSON.stringify(mess)+")")
}
function changeURL(url:string){
	browser.tabs.update(null, {
		url:url
	})
}

function getURL(){
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
function getTabId(): Promise<number>{
	return new Promise((ok, reject) => {
		browser.tabs.query({currentWindow: true, active: true}, (tab)=>{
			ok(tab[0].id)
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
function storageSetWords(words:string){
	return new Promise(async ok => {
		var tabId = await getTabId()
		await storageSet(saveWordsPrefix+tabId, words)
		await storageSet(latest_words, words)
		ok()
	})
}
// 保存された検索ワードをテキストボックスに自動入力
function storageGetWords(urlLoad=true):Promise<string> {
	return new Promise(async ok => {
		var tabId = await getTabId()
		var swords:string = await storageGet(saveWordsPrefix+tabId, undefined)
		if(swords == undefined){
			swords = await storageGet(latest_words, undefined)
		}
		if(swords != undefined){
			swords = swords.trim()
		}

		// 接頭文字をつける
		var pf = await storageGet('prefix', '', true)
		if(swords.indexOf(pf) != 0){
			swords = pf + ' ' + swords
		}

		ok(swords)
	})
}
function storageSetNum(words_nums:{[key:string]:number;}){
	return new Promise(async ok => {
		var tabId = await getTabId()
		await storageSet(saveNumPrefix+tabId, words_nums)
		ok()
	})
}
function storageGetNum():Promise<{[key:string]:number;}>{
	return new Promise(async ok => {
		var tabId = await getTabId()
		var swords:{[key:string]:number;} = await storageGet(saveNumPrefix+tabId)
		ok(swords)
	})
}

function executeFile(file:string):any{
	return new Promise(ok => {
		browser.tabs.executeScript(null,
			{file:file},
			(result)=>{
				ok(result)
			}
		)
	})
}
function executeCode(code:string):any{
	return new Promise(ok => {
		browser.tabs.executeScript(null,
			{code:code},
			(result)=>{
				ok(result)
			}
		)
	})
}

function setIcon(icon){
	chrome.browserAction.setIcon({path:icon})
}