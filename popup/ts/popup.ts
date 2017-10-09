// === on/offボタンクリック時の処理
const on_obj = <HTMLInputElement> document.getElementById('on')
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
var search_words_obj = <HTMLInputElement> document.getElementById('search_words')
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

		let cur = <HTMLInputElement> document.getElementById(word+'-cur-num')
		if(cur == null || cur.disabled==true){
			continue
		}
		let res = await executeCode('countBeforeWords('+JSON.stringify(word)+', "itel-highlight", '+regbool+')')
		let curnum = ''+res[0]
		let numstr = cur.innerText
		curnum = leftfill(curnum, '0', numstr.length)
		cur.innerText = curnum
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
	var w: []string = []
	for(let n = 0; n < words.length; n++){
		w[n] = encodeURIComponent(words[n])
	}
	return 'https://www.google.com/search?q='+w.join('+')
}

function getWords(){
	var search_words = search_words_obj.value
	return wordsSplit(search_words)
}

// 画面を全てアップデートする
async function updateAll(){
	var words = getWords()
	
	var results = await executeHighlight(words)
	var words_nums = results[0]
	updateButton(words)
	updateNums()
	var swords = search_words_obj.value
	storageSetWords(swords)
}
// 頻繁な更新対策
function updateAllTimeout(time){
	whereTimeout(updateAll, time)
}

// === 関数
function updateNums(){
	var buttons = document.getElementsByClassName('btn')
	for(let n = 0; n < buttons.length; n++){
		let button = <HTMLElement> buttons[n]
		var word = button.innerText
		updateNum(word, button)
	}
}
async function updateNum(word, btn, regbool=false){
	// ボタンに数字を追加
	var numret = await executeCode('countAllWords('+JSON.stringify(word)+', "itel-highlight", '+regbool+')')
	var num = numret[0]
	if(num == 0){
		btn.disabled = true
		return
	}
	btn.disabled = false
	var span = document.createElement('span')
	var padding = leftfill('', '0', (''+num).length)
	span.innerText = padding
	span.className = word+'-cur-num'
	
	var span2 = document.createElement('span')
	span2.innerText = num
	span2.className = word+'-num'
	
	btn.append('(')
	btn.append(span)
	btn.append('/')
	btn.append(span2)
	btn.append(')')
}
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
		let btn = <HTMLElement> document.createElement('button')
		btn.className = 'btn'
		btn.id = word
		btn.innerText = word
		btn.style.backgroundColor = colors[n%colors.length]
		btn.onclick = (e)=>{
			var children = btn_list_obj.children
			for(let cn = 0; cn < children.length; cn++){
				let child = <HTMLElement>children[cn]
				child.style.borderRadius = "0"
			}
			btn.style.borderRadius = "16px"
			
			// クリック時のハイライト選択移動
			var key_event = <KeyboardEvent>(e||window.event)
			if(key_event.ctrlKey){
				var url = getGoogleSearchURL([word])
				if(key_event.shiftKey){
					inject('window.open("'+url+'")')
				}else{
					changeURL(url)
				}
			}
			if(key_event.shiftKey){
				inject('scrollFocusPrevWord('+JSON.stringify(word)+', "itel-highlight", "itel-selected", '+regbool+')')
			}else{
				inject('scrollFocusNextWord('+JSON.stringify(word)+', "itel-highlight", "itel-selected", '+regbool+')')
			}
			
			updateCurNum(words)
		}
		
		updateNum(word, btn)
		
		btn_list_obj.appendChild(btn)
	}
}

// 最初に実行される
document.body.onload = async ()=>{
	// 以前の状態を思い出す
	var swords = await storageGetWords()
	if(swords != undefined){
		search_words_obj.value = swords + ' '
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
		updateCurNum(wordsSplit(swords))
		return
	}
}
