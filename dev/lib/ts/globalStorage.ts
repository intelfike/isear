class GlobalStorage{
	setItem(key:string ,value){
		storageSet(item.key, item.value)
	}
	getItem(key, callback){
		storageGet(key).then(callback)
	}
	removeItem(key){
		storageRemove(item.key)
	}
}

var globalStorage = new GlobalStorage()