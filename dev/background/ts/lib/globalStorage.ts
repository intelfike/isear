browser.runtime.onMessage.addListener(function(data, sender, sendResponse){
	if (data.pass != 'isear') {
		return
	}
	let item = data.item
	console.log(data.method, item)
	switch (data.method) {
	case 'get':
		let response = localStorage.getItem(item.key)
		console.log(response)
		sendResponse(response)
		break
	case 'set':
		localStorage.setItem(item.key, item.value)
		break
	case 'remove':
		localStorage.removeItem(item.key)
		break
	default:
		console.log("Error: undefined medtho '" + data.method + "'")
		break
	}
})