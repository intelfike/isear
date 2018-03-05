var command_mode:boolean = false;
document.body.onkeydown = (e) => {
	if(!command_mode){
		return
	}
	if(e.ctrlKey || e.shiftKey || e.altKey) {
		return
	}
	switch(e.key){
	case 'e':
		console.log('e')
		break
	default:
	}
}

function command(cname:string){
	switch(cname){
	case 'toggle_highlight':
		break
	case 'toggle_bars':
		break
	case 'retry':
		break
	default:

	}
}

    // "empty": {
    //   "suggested_key": {
    //     "default": "Alt+E"
    //   },
    //   "description": "検索ワードを空にする"
    // },
    // "toggle_highlight": {
    //   "suggested_key": {
    //     "default": "Alt+H"
    //   },
    //   "description": "ハイライトをON/OFF"
    // },
    // "toggle_bars": {
    //   "suggested_key": {
    //     "default": "Alt+B"
    //   },
    //   "description": "ハイライトバーをON/OFF"
    // },
    // "retry": {
    //   "suggested_key": {
    //     "default": "Alt+R"
    //   },
    //   "description": "ハイライトを更新"
    // }