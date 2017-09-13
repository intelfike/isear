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
function storageGet(key){
	return new Promise(ok => {
		chrome.storage.local.get(key, function(value){
			ok(value)
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