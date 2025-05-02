browser.runtime.onMessage.addListener(function(data, sender, sendResponse){
	if (data.pass != 'isear-globalStorage-send') {
		return
	}
	let item = data.item
	switch (data.method) {
	case 'get':
		getData(item.key, undefined, item.sync).then(sendResponse)
		break
	case 'set':
		storageSet(item.key, item.value, item.sync)
		break
	case 'remove':
		storageRemove(item.key, item.sync)
		break
	default:
		console.log("Error: undefined medtho '" + data.method + "'")
		break
	}
	return true
})

async function getData(key:string, def:any=undefined, sync:boolean=false){
	 let data = await storageGet(key, def, sync)
	 return JSON.stringify({'type':'isear-globalStorage','data':data})
}