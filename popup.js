// === ハイライト有効のチェックボックス
var enabled_obj = document.getElementById('enabled')
enabled_obj.onchange = async ()=>{
	var enabled = enabled_obj.checked
	await storageSet('enabled', enabled)
	var words = getWords()
	await executeHighlight(words)
	
	inputsEnable(enabled)
}
function inputsEnable(bool){
	search_words_obj.disabled = !bool
	var btns = document.getElementsByClassName('btn')
	for(let n = 0; n < btns.length; n++){
		btns[n].disabled = !bool
	}
	if(bool){
		document.body.style.backgroundColor = '#EFF'
	}else{
		document.body.style.backgroundColor = '#ACC'
	}
}

// === 検索ワードのテキストボックス
var search_words_obj = document.getElementById('search_words')
search_words_obj.onkeydown = (e)=>{
	switch(e.code){
	case 'Enter':
		if(e.ctrlKey && e.shiftKey){
			// 新しいタブでgoogle検索
			var words = getWords()
			var url = getGoogleSearchURL(words)
			inject('window.open("'+url+'")')
		}else if(e.ctrlKey){
			// google検索結果に遷移
			var words = getWords()
			var url = getGoogleSearchURL(words)
			changeURL(url)
		}else if(e.shiftKey){
			inject('scrollFocusPrev("itel-highlight","itel-selected")')
		}else{
			inject('scrollFocusNext("itel-highlight","itel-selected")')
		}
		break
	}
}
search_words_obj.onkeyup = (e)=>{
	if(
		e.key == 'Backspace' ||
		e.key == 'Delete' ||
		/^F\d$/.test(e.key) ||
		e.key.length == 1
	){
		updateAllTimeout(200)
	}
}

// === 関数
function getGoogleSearchURL(words){
	return 'https://www.google.com/search?q='+words.join('+')
}

function getWords(){
	var search_words = search_words_obj.value
	return wordsSplit(search_words)
}

// 画面を全てアップデートする
async function updateAll(){
	var words = getWords()
	
	updateButton(words)
	
	executeHighlight(words)
	
	var swords = search_words_obj.value
	storageSetWords(swords)
}
// 頻繁な更新対策
var timeouter
function updateAllTimeout(time){
	clearTimeout(timeouter)
	timeouter = setTimeout(function(){
		updateAll()
	}, time)
}

// === 関数

// 引数は文字列型配列、それによってボタンを作成
var btn_list_obj = document.getElementById('btn_list')
function updateButton(words){
	btn_list_obj.innerHTML = ''
	for(let n = 0; n < words.length; n++){
		let word = words[n]
		// 正規表現かどうか
		let regbool = false
		if(word.toUpperCase().indexOf(regPrefix) == 0){
			word = word.substr(4)
			regbool = true
		}
		console.log(regbool)
		
		let btn = document.createElement('button')
		btn.className = 'btn'
		btn.innerText = word
		btn.style.backgroundColor = colors[n%colors.length]
		btn.onclick = (e)=>{
			var children = btn_list_obj.children
			for(let cn = 0; cn < children.length; cn++){
				children[cn].style.borderRadius = "0"
			}
			btn.style.borderRadius = "16px"
		
			var key_event = e||window.event
			if(key_event.shiftKey){
				inject('scrollFocusPrevWord("'+word+'", "itel-highlight", "itel-selected", '+regbool+')')
			}else{
				inject('scrollFocusNextWord("'+word+'", "itel-highlight", "itel-selected", '+regbool+')')
			}
			
		}
		btn_list_obj.append(btn)
	}
}

// 最初に実行される
document.body.onload = async ()=>{
	search_words_obj.focus()
		
	// 以前の状態を思い出す
	var words = await storageGetWords()
	if(words != undefined){
		search_words_obj.value = words
	}
	
	var enabled = await storageGet('enabled')
	enabled_obj.checked = enabled['enabled']
	
	updateAll()
	inputsEnable(enabled_obj.checked)
}
