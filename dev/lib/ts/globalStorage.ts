class GlobalStorage{
	setItem(key:string ,value){
		storageSet(key, value)
	}
	getItem(key){
		return new Promise(async ok => {
			let val = storageGet(key)
			ok(val)
		})
	}
	removeItem(key){
		storageRemove(key)
	}
}

var globalStorage = new GlobalStorage()