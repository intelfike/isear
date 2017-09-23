// === on/offボタンクリック時の処理
var on_obj = document.getElementById('on')
on_obj.onclick = ()=>{
	var enabled = on_obj.innerText == 'ON'
	extensionEnable(enabled)
}
// 全機能停止
function extensionEnable(bool){
	storageSet('enabled', bool)
	inputsEnable(bool)
	var words = getWords()
	executeHighlight(words, bool)
}
// 入力禁止、デザイン変更
function inputsEnable(bool){
	if(bool){
		on_obj.innerText = "OFF"
		on_obj.style.backgroundColor = "#DDD"
		document.body.style.backgroundColor = '#EFF'
	}else{
		on_obj.innerText = "ON"
		on_obj.style.backgroundColor = "yellow"
		document.body.style.backgroundColor = '#ACC'
	}
	search_words_obj.disabled = !bool
	if(!bool){
		var btns = btn_list_obj.children
		for(let n = btns.length-1; n >= 0; n--){
			btns[n].remove()
		}
		return
	}
	var words = getWords()
	updateButton(words)
}

// === 検索ワードのテキストボックス
var search_words_obj = document.getElementById('search_words')
search_words_obj.onkeydown = (e)=>{
	switch(e.code){
	case 'Enter':
		if(e.ctrlKey){
			// google検索
			var tmpwords = getWords()
			var words = []
			for(let n = 0; n < tmpwords.length; n++){
				if(tmpwords[n].toUpperCase().indexOf(regPrefix) == 0){
					continue
				}
				words.push(tmpwords[n])
			}
			var url = getGoogleSearchURL(words)
			if(e.shiftKey){
				// 新しいタブでgoogle検索
				inject('window.open("'+url+'")')
			}else{
				changeURL(url)
			}
			break
		}
		if(e.shiftKey){
			inject('scrollFocusPrev("itel-highlight","itel-selected")')
			break
		}
		inject('scrollFocusNext("itel-highlight","itel-selected")')
		break
	}
}
search_words_obj.onkeyup = (e)=>{
	if(
		e.key == 'Backspace' ||
		e.key == 'Delete' ||
		e.key == 'Tab' ||
		/^F\d$/.test(e.key) ||
		e.key.length == 1
	){
		updateAllTimeout(200)
	}
}

// アップデートイベント
chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab){
	updateAll()
})

// === 関数
function getGoogleSearchURL(words){
	return 'https://www.google.com/search?q='+words.join('+')
}

function getWords(){
	var search_words = search_words_obj.value
	return wordsSplit(search_words)
}

// 画面を全てアップデートする
function updateAll(){
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
			word = word.substr(regPrefix.length)
			regbool = true
		}
		// ハイライト用の移動ボタン定義
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
	// 以前の状態を思い出す
	var words = await storageGetWords()
	if(words != undefined){
		search_words_obj.value = words
	}
	
	var enabled = await storageGet('enabled')
	enabled = enabled['enabled']
	if(enabled == undefined){
		enabled = true
	}
	extensionEnable(enabled)
	if(enabled){
		updateAll()
		search_words_obj.focus()
		return
	}
}
