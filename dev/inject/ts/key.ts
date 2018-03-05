var command_mode = false

function bodyKeydownEvent(e:KeyboardEvent, words:Words){
	if(!command_mode){
		return
	}
	if(e.ctrlKey || e.altKey) {
		return
	}
	if(document.activeElement != document.body){
		return
	}
	switch(e.key){
	case 'h':
	// 更新するたびに更新速度が直線的に悪化するバグのため一旦退避
		// if(e.repeat){
		// 	break
		// }
		// global_enabled = !global_enabled
		// parsed_main(words, global_enabled)
		break
	case 'b':
		if(e.repeat){
			break
		}
		showBars = !showBars
		barsVisible(words.array.length, showBars)
		break
	case 'r':
		// if(e.repeat){
		// 	break
		// }
		// parsed_main(words, true)
		break
	default:
		// isNaNの仕様により、" "が0に変換される
		if(isNaN(e.key) || e.key == ' '){
			break
		}
		var num:number = parseInt(e.key)
		var reverse = e.shiftKey
		if(num == 0){
			patrolAll(reverse)
			break
		}
		if(num > words.array.length){
			break
		}
		var word:Word = words.array[num-1]
		patrolWord(word, reverse)
	}
}

function patrolAll(reverse:boolean){
	if(!reverse){
		scrollFocusNext(hlClass, selected)
		return
	}
	scrollFocusPrev(hlClass, selected)
}

function patrolWord(word:Word, reverse:boolean){
	if(!reverse){
		scrollFocusNextWord(word.origin, hlClass, selected, word.regbool)
		return
	}
	scrollFocusPrevWord(word.origin, hlClass, selected, word.regbool)
}
