
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
		bgColors = await storageGet('bgColors', bgColors, true)
		await executeCode('bgColors = ' + JSON.stringify(bgColors))

		var enbar = await storageGet('enabled_bar', true, true)
		var shbar = await storageGet('show_bar', true, true)
		await executeCode('showBars = ' + JSON.stringify(shbar))
		var regbool = await storageGet('regbool', false, true)

		var result = await executeCode('itel_main('+JSON.stringify(swords)+', '+bool+', '+enbar+', '+regbool+')')
		ok(<Promise<{[key:string]:number;}>> result[0])
	})
}

function inject(code: string){
	chrome.tabs.executeScript(null,
		{code:code}
	)
}
function log(mess:any){
	inject("console.log("+JSON.stringify(mess)+")")
}
function changeURL(url:string){
	chrome.tabs.update(null, {
		url:url
	})
}

function getURL(){
	return new Promise((ok, reject) => {
		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
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
		chrome.tabs.query({currentWindow: true, active: true}, (tab)=>{
			ok(tab[0].id)
		})
	})
}
function storageSet(key:string, value:any, sync:boolean=false){
	return new Promise(ok => {
		var data = {}
		data[''+key] = value

		var st = chrome.storage.local
		if(sync){
			st = chrome.storage.sync
		}
		st.set(data, ok)
	})
}
function storageGet(key:string, def:any=undefined, sync:boolean=false):Promise<any>{
	return new Promise(ok => {
		var st = chrome.storage.local
		if(sync){
			st = chrome.storage.sync
		}
		st.get(key, function(value){
			console.log(key, value, key in value)
			if(value == undefined || !(key in value)){
				ok(def)
				return
			}
			ok(value[key])
		})
	})
}
function storageRemove(key:string){
	return new Promise(ok =>{
		chrome.storage.local.remove(key, ok)
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
		var swords:string = await storageGet(saveWordsPrefix+tabId, '')
		if(swords == ''){
			swords = await storageGet(latest_words, '')
		}
		if(swords != ''){
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
		chrome.tabs.executeScript(null,
			{file:file},
			(result)=>{
				ok(result)
			}
		)
	})
}
function executeCode(code:string):any{
	return new Promise(ok => {
		chrome.tabs.executeScript(null,
			{code:code},
			(result)=>{
				ok(result)
			}
		)
	})
}