function inject(code, callback){
	chrome.tabs.executeScript(null,
		{code:code},
		callback
	)
}
function log(mess){
	inject("console.log("+JSON.stringify(mess)+")")
}
function changeURL(url){
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
function getTabId(){
	return new Promise((ok, reject) => {
		chrome.tabs.getSelected(null, function (tab) {
			ok(tab.id)
		})
	})
}
function storageSet(key, value){
	return new Promise(ok => {
		var data = {}
		data[''+key] = value
		chrome.storage.local.set(data, ()=>{
			ok()
		})
	})
}
function storageGet(key){
	return new Promise(ok => {
		chrome.storage.local.get(''+key, function(value){
			ok(value)
		})
	})
}
function storageRemove(key){
	return new Promise(ok =>{
		chrome.storage.local.remove(''+key, ok)
	})
}
// wordsには文字列を渡してね
function storageSetWords(words, urlsave=true){
	return new Promise(async ok => {
		var tabId = await getTabId()
		await storageSet(tabId, words)
		await storageSet('words', words)
		ok()
	})
}
// 保存された検索ワードをテキストボックスに自動入力
function storageGetWords(urlLoad=true){
	return new Promise(async ok => {
		var tabId = await getTabId()
		var value = await storageGet(tabId)
		var words = value[tabId]
		if(words == undefined){
			var value = await storageGet('words')
			words = value['words']
		}
		ok(words)
	})
}

function executeFile(file){
	return new Promise(ok => {
		chrome.tabs.executeScript(null,
			{file:file},
			(result)=>{
				ok(result)
			}
		)
	})
}
function executeCode(code){
	return new Promise(ok => {
		chrome.tabs.executeScript(null,
			{code:code},
			(result)=>{
				ok(result)
			}
		)
	})
}