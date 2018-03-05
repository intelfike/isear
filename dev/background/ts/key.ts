var command_mode:boolean = false;
chrome.commands.onCommand.addListener(async function(name:string){
	if(name == 'switch_mode'){
		command_mode = !command_mode
		storageSet('command_mode', command_mode)
		executeCode('command_mode = ' + command_mode)
		return
	}
	if(!command_mode){
		return
	}
	switch(name){
	case 'retry':
		retry()
		break
	case 'toggle_bars':
		toggle_bars()
		break
	}
})
