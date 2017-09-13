function inject(code){
	chrome.tabs.executeScript(null,
		{code:code}
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
	return new Promise(ok => {
		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
			var url = tabs[0].url;
			ok(url)
		})
	})
}
function storageSet(key, value){
	return new Promise(ok => {
		var data = {}
		data[key] = value
		chrome.storage.local.set(data, ()=>{
			ok()
		})
	})
}
function storageGet(key){
	return new Promise(ok => {
		chrome.storage.local.get(key, function(value){
			ok(value)
		})
	})
}
// 保存された検索ワードをテキストボックスに自動入力
function storageGetWords(){
	return new Promise(async ok => {
		var words = ''
		var url = await getURL()
		var value = await storageGet(url)
		words = value[url]
		if(words == undefined){
			var value = await storageGet('value')
			words = value['value']
		}
		ok(words)
	})
}

function executeFile(file){
	return new Promise(ok => {
		chrome.tabs.executeScript(null,
			{file:"inj.js"},
			()=>{
				ok()
			}
		)
	})
}
function executeCode(code){
	return new Promise(ok => {
		chrome.tabs.executeScript(null,
			{code:code},
			()=>{
				ok()
			}
		)
	})
}