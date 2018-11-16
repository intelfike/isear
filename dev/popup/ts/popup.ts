// === on/offボタンクリック時の処理
const on_obj = <HTMLInputElement> document.getElementById('on')
on_obj.onclick = ()=>{
	var enabled:boolean = on_obj.innerText == 'ON'
	extensionEnable(enabled)
	inputsEnable(enabled)
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
		on_obj.style.backgroundColor = "#DDD"
		document.body.className = 'onbg'
	}else{
		on_obj.innerText = "ON"
		on_obj.style.backgroundColor = "yellow"
		document.body.className = 'offbg'
	}
	// search_words_obj.disabled = !bool
	retry.disabled = !bool
	if(!bool){
		var btns = btn_list_obj.children
		for(let n = btns.length-1; n >= 0; n--){
			btns[n].remove()
		}
		return
	}else{
		updateButton()
	}
}

// === 検索ワードのテキストボックス
var search_words_obj = <HTMLInputElement> document.getElementById('search_words')
search_words_obj.onkeydown = async (e)=>{
	switch(e.key){
	case 'Enter':
		if(e.ctrlKey){
			// google検索
			var swords:string[] = search_words_obj.value.split(/[\s\t]/g)
			var search_swords:string[] = []
			for(let n = 0; n < swords.length; n++){
				let word = swords[n]
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
		if(changeInput()){
			updateAll()
		}

		if(e.shiftKey){
			inject('scrollFocusPrev("itel-highlight","itel-selected")')
		}else{
			inject('scrollFocusNext("itel-highlight","itel-selected")')
		}
		break
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
browser.runtime.onMessage.addListener(async function(request, sender, sendResponse){
	if(request.name != 'done highlight'){
		return
	}
	var enabled = await storageGet('enabled', true)
	if(enabled){
		// whereTimeout('updateButton', updateButton, 200)
		updateButton()
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
		var words:Words = await getWords()

		await executeHighlight(swords)

		updateButton()
		storageSetWords(swords)
		ok()
	})
}
// 頻繁な更新対策
function updateAllTimeout(time:number){
	whereTimeout("アップデート", updateAll, time)
}

// 引数は文字列型配列、それによってボタンを作成
var btn_list_obj = document.getElementById('btn_list')
async function updateButton(){
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
		}
		if(word.count.num == 0){
			btn.disabled = true
		}
		btn_list_obj.appendChild(btn)
	}
}

// 最初に実行される
document.body.onload = async ()=>{
	var STRING = getSTRING()
	search_words_obj.placeholder = STRING['popup']['SEARCH_BOX']

	var enabled:boolean = await storageGet('enabled', true)
	bodyKeyDownEvent(enabled)

	// 以前の状態を思い出す
	var swords:string = await storageGetWords()
	await remind(swords)

	inputsEnable(enabled)
	if(enabled){
		search_words_obj.focus()
		search_words_obj.selectionStart = 0
		search_words_obj.selectionEnd = swords.length + 1
		return
	}
}

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
		default:
			return
		}
		e.preventDefault()
	}
}

function remind(swords:string){
	return new Promise(async ok=>{
		bgColors = await storageGet('bgColors', bgColors, true)

		if(swords == undefined){
			ok()
			return
		}
		if(swords.length == 0){
			ok()
			return
		}

		search_words_obj.value = swords + ' '
		
		changeInput()
		ok()
	})
}