// class GlobalStorage{
// 	getFuncs = {}
// 	url = null
// 	iframe = null

// 	constructor(url:string) {
// 		if (document.getElementById('isear_iframe')) {
// 			return
// 		}
// 		this.url = url

// 		this.iframe = document.createElement('iframe')
// 		this.iframe.id = 'isear_iframe'
// 		this.iframe.src = url
// 		this.iframe.style = 'display:none'
// 		document.body.appendChild(this.iframe)
// 	}

// 	post(method, item) {
// 		var data = {
// 			'pass'   : 'isear',
// 			'method' : method,
// 			'item'   : item,
// 		}
// 		var json = JSON.stringify(data)
// 		if (typeof this.iframe.contentWindow) {
// 			this.iframe.contentWindow.postMessage(json, '*')
// 		}
// 	}

// 	setItem(key:string ,value){
// 		this.post('set', {'key':key, 'value':value})
// 	}

// 	getItem(key, callback){
// 		this.getFuncs[key] = callback
// 		this.post('get', {'key':key})
// 	}

// 	removeItem(key){
// 		this.post('remove', {'key':key})
// 	}
// }

// var globalStorage = null

// function initGlobalStorage() {
// 	var url = 'https://ss1.coressl.jp/intelfike.m1002.coreserver.jp'

// 	globalStorage = new GlobalStorage(url)
// 	window.onmessage = e => {
// 		if (e.origin != 'https://ss1.coressl.jp') {
// 			return
// 		}
// 		var data = JSON.parse(e.data)
// 		globalStorage.getFuncs[data.item.key](data.item.value)
// 	}
// }

class GlobalStorage{
	send(method, item, func=null) {
		var data = {
			'pass'   : 'isear',
			'method' : method,
			'item'   : item,
		}
		// var json = JSON.stringify(data)
		browser.runtime.sendMessage(data, function(response){
			if (func == null) {
				return
			}
			func(response)
		})
	}

	setItem(key:string ,value){
		this.send('set', {'key':key, 'value':value})
	}

	getItem(key, callback){
		this.send('get', {'key':key}, callback)
	}

	removeItem(key){
		this.send('remove', {'key':key})
	}
}

var globalStorage = null

function initGlobalStorage() {
	globalStorage = new GlobalStorage()
}