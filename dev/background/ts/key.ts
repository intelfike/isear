chrome.commands.onCommand.addListener(async function(name:string){
	var enabled = await storageGet('enabled', true)
	if(!enabled){
		return
	}
	if(name == 'switch_mode'){
		var command_mode = await storageGet('command_mode')
		command_mode = !command_mode
		await storageSet('command_mode', command_mode)
		await executeCode('command_mode = ' + command_mode)
		if(command_mode){
			setIcon('data/icons/icon32command.png')
			alert("isearのコマンドモードが有効になりました\n\n[1]~[9] 対応する番号のワードを巡回する\n[0] 全ワードを巡回する\n[B] ハイライトバーの表示を切り替える")
			return
		}
		setIcon('data/icons/icon32.png')
		alert("isearのコマンドモードが無効になりました")
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
