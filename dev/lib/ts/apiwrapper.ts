
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
		bgColors = await storageGet('bgColors', bgColors)
		await executeCode('bgColors = ' + JSON.stringify(bgColors))

		var sb = await storageGet('show_bar', true)
		var regbool = await storageGet('regbool', false)

		var result = await executeCode('itel_main('+JSON.stringify(swords)+', '+bool+', '+sb+', '+regbool+')')
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
		chrome.tabs.getSelected(null, function (tab) {
			ok(tab.id)
		})
	})
}
function storageSet(key:string, value:any){
	return new Promise(ok => {
		var data = {}
		data[''+key] = value
		chrome.storage.local.set(data, ok)
	})
}
function storageGet(key:string, def:any=undefined):Promise<any>{
	return new Promise(ok => {
		chrome.storage.local.get(key, function(value){
			if(value[key] == undefined){
				value[key] = def
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
		var swords:string = await storageGet(saveWordsPrefix+tabId)
		if(swords == undefined){
			swords = await storageGet(latest_words)
		}
		if(swords != undefined){
			swords = swords.trim()
		}

		// 接頭文字をつける
		var pf = await storageGet('prefix', '')
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