class GlobalStorage{
	send(method, item) {
		return new Promise(ok => {
			var data = {
				'pass'   : 'isear-globalStorage-send',
				'method' : method,
				'item'   : item,
			}
			// var json = JSON.stringify(data)
			browser.runtime.sendMessage(data, function(response){
				ok(response)
			})
		})
	}

	setItem(key:string ,value, sync=false){
		this.send('set', {'key':key, 'value':value, 'sync':sync})
	}

	getItem(key, sync=false){
		return new Promise(async ok => {
			let response:any = await this.send('get', {'key':key, 'sync':sync})
			if (!response) {
				ok(null)
				return
			}
			let data = JSON.parse(response)
			if (typeof data.type == undefined || data.type != 'isear-globalStorage') {
				ok(null)
				return
			}
			ok(data.data)
		})
	}
	removeItem(key, sync=false){
		this.send('remove', {'key':key, 'sync':sync})
	}
}

var globalStorage = null

function initGlobalStorage() {
	globalStorage = new GlobalStorage()
}