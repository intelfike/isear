browser.runtime.onMessage.addListener(function(data, sender, sendResponse){
	if (data.pass != 'isear-globalStorage-send') {
		return
	}
	let item = data.item
	switch (data.method) {
	case 'get':
		getData(item.key).then(sendResponse)
		break
	case 'set':
		storageSet(item.key, item.value)
		break
	case 'remove':
		storageRemove(item.key)
		break
	default:
		console.log("Error: undefined medtho '" + data.method + "'")
		break
	}
	return true
})

async function getData(key){
	 let data = await storageGet(key)
	 return JSON.stringify({'type':'isear-globalStorage','data':data})
}