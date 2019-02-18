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
		this.send('get', {'key':key}, function(j){
			var data = JSON.parse(j)
			if (typeof data.type == undefined || data.type != 'globalStorage') {
				return
			}
			callback(data.data)
		})
	}

	removeItem(key){
		this.send('remove', {'key':key})
	}
}

var globalStorage = null

function initGlobalStorage() {
	globalStorage = new GlobalStorage()
}