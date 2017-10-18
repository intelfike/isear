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
function storageSet(key:string, value){
	return new Promise(ok => {
		var data = {}
		data[''+key] = value
		chrome.storage.local.set(data, ok)
	})
}
function storageGet(key:string):Promise<any>{
	return new Promise(ok => {
		chrome.storage.local.get(key, function(value){
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
function storageSetWords(swords:string){
	return new Promise(async ok => {
		var tabId = await getTabId()
		await storageSet(saveWordsPrefix+tabId, swords)
		await storageSet(latest_words, swords)
		// 履歴を保存
		var whn:number = await storageGet('words_history_num')
		if(whn == undefined){
			whn = 0
		}
		await storageSet('words_history_'+whn, swords)
		await storageSet('words_history_num', (whn+1) % words_history_limit)
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