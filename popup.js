// === ハイライト有効のチェックボックス
var enabled_obj = document.getElementById('enabled')
enabled_obj.onchange = async ()=>{
	await storageSet('enabled', enabled_obj.checked)
	var words = getWords()
	await executeHighlight(words)
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
		let btn = document.createElement('button')
		btn.innerText = word
		btn.style.backgroundColor = colors[n%colors.length]
		btn.onclick = ()=>{
			inject('scrollFocusNextWord("'+word+'", "itel-highlight", "itel-selected")')
		}
		btn_list_obj.append(btn)
	}
}

// 最初に実行される
document.body.onload = async ()=>{
	search_words_obj.focus()

	chrome.tabs.insertCSS(null, {
		code: '#itel-selected{background-color:red !important;}'
	})
	
	// 以前の状態を思い出す
	var words = await storageGetWords()
	if(words != undefined){
		search_words_obj.value = words
	}
	
	var enabled = await storageGet('enabled')
	enabled_obj.checked = enabled['enabled']
	
	updateAll()
}
