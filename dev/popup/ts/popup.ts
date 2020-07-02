var changeInput = false

// === on/offボタンクリック時の処理
const on_obj = <HTMLInputElement> document.getElementById('on')
on_obj.onclick = async ()=>{
	on_obj.disabled = true
	var enabled:boolean = on_obj.innerText == 'ON'
	await extensionEnable(enabled)
	inputsEnable(enabled)
	on_obj.disabled = false
	search_words_obj.focus()
}

// +ボタンクリック時の処理
const addtemplate = <HTMLInputElement> document.getElementById('addtemplate')
addtemplate.onclick = async ()=>{
	var at = await storageGet('prefix', '', true)
	var swords = search_words_obj.value.trim()
	if (new RegExp(at + '$').test(swords)) {
		return
	}
	search_words_obj.value = swords + ' ' + at
	search_words_obj.focus()
	await updateAll()
}

// ⭮ボタンクリック時の処理
const retry = <HTMLInputElement> document.getElementById('retry')
retry.onclick = async ()=>{
	retry.disabled = true
	await updateAll()
	retry.disabled = false
}

// 入力をtrue有効・false無効、デザイン変更
async function inputsEnable(bool:boolean){
	if(bool){
		on_obj.innerText = "OFF"
		document.body.className = 'onbg'
	}else{
		on_obj.innerText = "ON"
		document.body.className = 'offbg'
	}

	updateButtons()
}

// === 検索ワードのテキストボックス
var search_words_obj = <HTMLInputElement> document.getElementById('search_words')
search_words_obj.onkeyup = () => {
	whereTimeout('キーワード保存', ()=>{
		storageSetWords(search_words_obj.value)
	}, 200)
}
var log_num = 0
var not_log = ''
var prev = null
search_words_obj.onkeydown = async (e) => {
	// 入力内容にさいが出ていないかチェック
	if (prev == null){
		prev = await storageGetWords()
	}
	let current = search_words_obj.value.trim()
	if (prev != current) {
		prev = current
		changeInput = true
	}

	switch(e.key){
	case 'Enter':
		if(e.ctrlKey){
			// google検索
			var sswords:string[] = search_words_obj.value.split(/[\s\t]/g)
			var search_swords:string[] = []
			for(let n = 0; n < sswords.length; n++){
				let word = sswords[n]
				if(word.toUpperCase() == regPrefix){
					break
				}
				if(word.toUpperCase().indexOf(regPrefix) == 0){
					continue
				}
				search_swords.push(word)
			}
			var url = getGoogleSearchURL(search_swords)
			if(e.shiftKey){
				// 新しいタブでgoogle検索
				inject('window.open("'+url+'")')
			}else{
				changeURL(url)
			}
			break
		}
		if(changeInput){
			changeInput = false
			updateAll() // ハイライトを更新するときはハイライトを辿らない
			return
		}

		if(e.shiftKey){
			inject('scrollFocusPrev("itel-highlight","itel-selected")')
		} else {
			inject('scrollFocusNext("itel-highlight","itel-selected")')
		}
		break
	case 'ArrowUp':
		if(await getLogsEnabled()){
			var logs = await getLogs()
			if (log_num < logs.length) {
				if (log_num == 0) {
					not_log = current
				}
				log_num++
			}
			logs.splice(0, 0, '')
			search_words_obj.value = logs[log_num]
		} else {
			clearLogs()
		}
		break
	case 'ArrowDown':
		if(await getLogsEnabled()){
			var logs = await getLogs()
			if (log_num > 0) {
				log_num--
			}
			logs.splice(0, 0, not_log)
			search_words_obj.value = logs[log_num]
		} else {
			clearLogs()
		}
		break
	default:
		break
	}
}


// アップデートイベント
browser.runtime.onMessage.addListener(async function(request, sender, sendResponse){
	if(request.name != 'done highlight'){
		return
	}
	var enabled = await storageGet('enabled', true)
	if(enabled){
		updateButtons()
	}
})

// === 関数
function getGoogleSearchURL(words:string[]){
	var w: string[] = []
	for(let n = 0; n < words.length; n++){
		w[n] = encodeURIComponent(words[n])
	}
	return 'https://www.google.com/search?q='+w.join('+')
}

function getSwords():string{
	return search_words_obj.value
}
function getWords():Promise<Words>{
	return new Promise(async ok => {
		var swords:string = getSwords()
		var words:Words = new Words(swords)
		// ボタンの個数を取得
		var words_nums:{[key:string]:number;} = await storageGetNum()
		for(let sword in words_nums){
			let num = words_nums[sword]
			let word = words.map[sword]
			if(word == undefined){
				continue
			}
			word.count.num = num
		}
		ok(words)
	})
}

// 画面を全てアップデートする
function updateAll(){
	return new Promise(async ok => {
		var swords:string = getSwords()
		storageSetWords(swords, true)
		var words:Words = await getWords()

		await executeHighlight(swords)

		updateButtons()
		ok()
	})
}
// 頻繁な更新対策
function updateAllTimeout(time:number){
	whereTimeout("アップデート", updateAll, time)
}

// 引数は文字列型配列、それによってボタンを作成
var btn_list_obj = document.getElementById('btn_list')
async function updateButtons(){
	var words:Words = await getWords()

	btn_list_obj.innerText = ''
	for(let n = 0; n < words.array.length; n++){
		let word = words.array[n]

		// ハイライト用の移動ボタン定義
		let btn = <HTMLInputElement> document.createElement('button')
		btn.className = 'btn'
		btn.id = word.origin
		btn.innerText = word.origin
		btn.tabIndex = n + 2
		btn.style.backgroundColor = word.bgColor
		// btn.title = '(' +  + '/' +  + ')'
		btn.title = word.count.num + '件ヒット'
		btn.onclick = (e)=>{
			// クリック時のハイライト選択移動
			var key_event = <KeyboardEvent>(e||window.event)
			if(key_event.ctrlKey){
				var url = getGoogleSearchURL([word.origin])
				if(key_event.shiftKey){
					inject('window.open("'+url+'")')
				}else{
					changeURL(url)
				}
			}
			if(key_event.shiftKey){
				inject('scrollFocusPrevWord('+JSON.stringify(word.origin)+', "itel-highlight", "itel-selected", '+word.regbool+')')
			}else{
				inject('scrollFocusNextWord('+JSON.stringify(word.origin)+', "itel-highlight", "itel-selected", '+word.regbool+')')
			}
			search_words_obj.focus()
		}
		btn.addEventListener('wheel', e => {
			let y = e.deltaY
			if (y != 0) {
				if (y <= 1) {
					// 上スクロール
					inject('scrollFocusPrevWord('+JSON.stringify(word.origin)+', "itel-highlight", "itel-selected", '+word.regbool+')')
				} else {
					// 下スクロール
					inject('scrollFocusNextWord('+JSON.stringify(word.origin)+', "itel-highlight", "itel-selected", '+word.regbool+')')
				}
			}
		})
		if(word.count.num == 0){
			btn.disabled = true
		}
		btn_list_obj.appendChild(btn)
	}
}

// 最初に実行される
document.body.onload = async ()=>{
	var STRING = getSTRING()
	lang_set_attr('textbox-placeholder', 'placeholder', {
		ja: 'Enterでページ内検索',
		en: 'Enter: Search on Page',
	})

	var enabled:boolean = await storageGet('enabled', true)

	var ph:boolean = await storageGet('popup_highlight', false, true)
	var pc:boolean = await storageGet('popup_highlight_close', false)
	if (ph && pc) {
		// ポップアップ時のみハイライト 復帰
		await storageSet('popup_highlight_close', false)
		await extensionEnable(true)
		enabled = true
	}

	bodyKeyDownEvent(enabled)
	// 以前の状態を思い出す
	var swords:string = await storageGetWords()
	if (swords == undefined) {
		swords = ''
	}
	await remind(swords)

	inputsEnable(enabled)
	search_words_obj.focus()
	if(enabled){
		search_words_obj.selectionStart = 0
		search_words_obj.selectionEnd = swords.length + 1
	}

	// 追加用定型文があれば+ボタンを表示する
	var tt = await storageGet('template-type', 'add', true)
	if (tt == 'add') {
		var at = await storageGet('prefix', '', true)
		if (at != '') {
			addtemplate.style.display = 'block'
		}
	}


	if (changeInput) {
		updateAll()
	}
}

var background = chrome.extension.getBackgroundPage();
addEventListener("unload", function (event) {
	// ポップアップを閉じたときの処理
    background.popup_unload()
}, true);

function bodyKeyDownEvent(enabled:boolean){
	document.body.onkeydown = async (e)=>{
		if(!e.ctrlKey){
			return
		}
		switch(e.key){
		case 'e':
			search_words_obj.focus()
			search_words_obj.value = ""
			break
		case 'r':
			if(enabled){
				return
			}
			retry.onclick(null)
			break
		case 'h':
			on_obj.onclick(null)
			break
		case 't':
			chrome.tabs.create(null)
			break
		default:
			return
		}
		e.preventDefault()
	}
}

function remind(swords:string){
	return new Promise(async ok=>{
		bgColors = await getBgColor()

		if(swords == undefined){
			ok()
			return
		}
		if(swords.length == 0){
			ok()
			return
		}

		search_words_obj.value = swords + ' '
		
		ok()
	})
}

browser.tabs.onActivated.addListener(async function(activeInfo){
	var swords:string = await storageGetWords()
	await remind(swords)
	search_words_obj.focus()
})