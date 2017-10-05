// === on/offボタンクリック時の処理
var on_obj = document.getElementById('on')
on_obj.onclick = ()=>{
	var enabled = on_obj.innerText == 'ON'
	extensionEnable(enabled)
}
// 全機能停止
function extensionEnable(bool, update=true){
	storageSet('enabled', bool)
	inputsEnable(bool)
	var words = getWords()
	if(update){
		executeHighlight(words, bool)
	}
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
search_words_obj.onkeydown = async (e)=>{
	switch(e.code){
	case 'Enter':
		if(e.ctrlKey){
			// google検索
			words = search_words_obj.value.split(/[\s\t]/g)
			var search_words = []
			for(let n = 0; n < words.length; n++){
				let word = words[n]
				if(words[n].toUpperCase() == regPrefix){
					break
				}
				if(words[n].toUpperCase().indexOf(regPrefix) == 0){
					continue
				}
				search_words.push(word)
			}
			var url = getGoogleSearchURL(search_words)
			if(e.shiftKey){
				// 新しいタブでgoogle検索
				inject('window.open("'+url+'")')
			}else{
				changeURL(url)
			}
			break
		}
		if(changeInput()){
			updateAll()
		}
		
		if(e.shiftKey){
			inject('scrollFocusPrev("itel-highlight","itel-selected")')
		}else{
			inject('scrollFocusNext("itel-highlight","itel-selected")')
		}
		var words = getWords()
		updateCurNum(words)
		break
	}
}
async function updateCurNum(words){
	// ハイライトの位置を表示
	for(let n = 0; n < words.length; n++){
		let word = words[n]
		// 正規表現かどうか
		let regbool = false
		if(word.toUpperCase().indexOf(regPrefix) == 0){
			word = word.substr(regPrefix.length)
			regbool = true
		}

		let res = await executeCode('countBeforeWords("'+word+'", "itel-highlight", '+regbool+')')
		let curnum = ''+res[0]
		let numstr = document.getElementById(word + '-num').innerText
		curnum = leftfill(curnum, '0', numstr.length)
		let button = document.getElementById(word + '-cur-num')
		button.innerText = curnum
	}
}

var prev_input = ""
function changeInput(){
	var input = search_words_obj.value
	var bool = (input != prev_input)
	// log(input)
	prev_input = input
	return bool
}

// アップデートイベント
chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab){
	updateAllTimeout(200)
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
async function updateAll(){
	var words = getWords()
	
	updateButton(words)
	var results = await executeHighlight(words)
	words_nums = results[0]
	for(word in words_nums){
		var num = words_nums[word]
		var button = document.getElementById(word)
		if(num == 0){
			// ボタンを無効に
			button.disabled = true
			continue
		}
		button.innerText = word + '('
		var word_cur_num = document.createElement('span')
		word_cur_num.id = word+'-cur-num'
		word_cur_num.innerText = leftfill('','0',(''+num).length)
		button.append(word_cur_num)
		button.append('/')
		var word_num = document.createElement('span')
		word_num.id = word+'-num'
		word_num.innerText = num
		button.append(word_num)
		button.append(')')
	}
	
	var swords = search_words_obj.value
	storageSetWords(swords)
}
// 頻繁な更新対策
function updateAllTimeout(time){
	whereTimeout(updateAll, time)
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
		btn.id = word
		btn.innerText = word
		btn.style.backgroundColor = colors[n%colors.length]
		btn.onclick = (e)=>{
			var children = btn_list_obj.children
			for(let cn = 0; cn < children.length; cn++){
				children[cn].style.borderRadius = "0"
			}
			btn.style.borderRadius = "16px"
			
			var key_event = e||window.event
			log(regbool)
			if(key_event.ctrlKey){
				var url = getGoogleSearchURL([word])
				if(key_event.shiftKey){
					inject('window.open("'+url+'")')
				}else{
					changeURL(url)
				}
			}
			if(key_event.shiftKey){
				inject('scrollFocusPrevWord("'+word+'", "itel-highlight", "itel-selected", '+regbool+')')
			}else{
				inject('scrollFocusNextWord("'+word+'", "itel-highlight", "itel-selected", '+regbool+')')
			}
			
			updateCurNum(words)
		}
		btn_list_obj.append(btn)
	}
}

// 最初に実行される
document.body.onload = async ()=>{
	// 以前の状態を思い出す
	var words = await storageGetWords()
	if(words != undefined){
		search_words_obj.value = words + ' '
		changeInput()
	}
	
	var enabled = await storageGet('enabled')
	enabled = enabled['enabled']
	if(enabled == undefined){
		enabled = true
	}
	extensionEnable(enabled, false)
	if(enabled){
		search_words_obj.focus()
		return
	}
}
