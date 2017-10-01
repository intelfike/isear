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
function storageSet(key, value){
	return new Promise(ok => {
		var data = {}
		data[key] = value
		chrome.storage.local.set(data, ()=>{
			ok()
		})
	})
}
// wordsには文字列を渡してね
function storageSetWords(words, urlsave){
	if(urlsave == undefined){
		urlsave = true
	}
	return new Promise(async ok => {
		var url = await getURL()
		if(url != '' && urlsave){
			await storageSet(url, words)
		}

		await storageSet('value', words)
		ok()
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
function storageGetWords(urlLoad){
	if(urlLoad == undefined){
		urlLoad = true
	}
	return new Promise(async ok => {
		var words = ''
		var url = await getURL()

		var value = await storageGet(url)
		if(url != '' && urlLoad){
			words = value[url]
		}
		if(words == undefined || words == ''){
			var value = await storageGet('value')
			words = value['value']
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