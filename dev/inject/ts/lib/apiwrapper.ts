// function sendMessage(name:string, message:string='') {
// 	return new Promise(ok => {
// 		browser.runtime.sendMessage({ name: name, message: message }, function(response){
// 			ok(response)
// 		})
// 	})
// }

function sendMessage(name:string, message:any='') {
	browser.runtime.sendMessage({ name: name, message: message })
}

function onMessage(name:string, callback:(message: any) => void) {
	browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
		if(request.name == name){
			callback(request.message)
		}
	})
}
