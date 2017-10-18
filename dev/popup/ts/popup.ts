// === on/offボタンクリック時の処理
const on_obj = <HTMLInputElement> document.getElementById('on')
on_obj.onclick = ()=>{
	var enabled:boolean = on_obj.innerText == 'ON'
	extensionEnable(enabled)
}
// 全機能停止
function extensionEnable(bool:boolean, update:boolean=true){
	storageSet('enabled', bool)
	inputsEnable(bool)
	var words:string = getSwords()
	if(update){
		executeHighlight(words, bool)
	}
}
// 入力禁止、デザイン変更
async function inputsEnable(bool:boolean){
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
	var swords:string = getSwords()
	updateButton()
}

// === 検索ワードのテキストボックス
var search_words_obj = <HTMLInputElement> document.getElementById('search_words')
search_words_obj.onkeydown = async (e)=>{
	switch(e.code){
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
chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab){
	whereTimeout(updateButton, 200)
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
async function updateAll(){
	var swords:string = getSwords()
	var words:Words = await getWords()

	var words_nums:{[key:string]:number;} = await executeHighlight(swords)
	await storageSetNum(words_nums)

	updateButton()
	storageSetWords(swords)
}
// 頻繁な更新対策
function updateAllTimeout(time:number){
	whereTimeout(updateAll, time)
}

// 引数は文字列型配列、それによってボタンを作成
var btn_list_obj = document.getElementById('btn_list')
async function updateButton(){
	var words:Words = await getWords()
	
	btn_list_obj.innerHTML = ''
	for(let n = 0; n < words.array.length; n++){
		let word = words.array[n]

		// ハイライト用の移動ボタン定義
		let btn = <HTMLInputElement> document.createElement('button')
		btn.className = 'btn'
		btn.id = word.origin
		btn.innerText = word.origin
		btn.style.backgroundColor = word.color
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
				inject('scrollFocusPrevWord('+JSON.stringify(word.origin)+', "itel-highlight", "itel-selected", '+(word.regexp!=undefined)+')')
			}else{
				inject('scrollFocusNextWord('+JSON.stringify(word.origin)+', "itel-highlight", "itel-selected", '+(word.regexp!=undefined)+')')
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
	// 以前の状態を思い出す
	var swords:string = await storageGetWords()
	if(swords != undefined){
		search_words_obj.value = swords + ' '
		changeInput()

		// 検索履歴を表示
		var whn:number = await storageGet('words_history_num')
		if(whn == undefined){
			whn = 0
		}
		let last:number = whn - 1
		var whobj = document.getElementById('words_history')
		while(true){
			var swords:string = await storageGet('words_history_'+whn)
			if(swords == undefined){
				break
			}
			let item = document.createElement('option')
			item.value = swords
			item.onfocus = ()=>{
				item.scrollIntoViewIfNeeded()
			}
			whobj.appendChild(item)
			whn++
			whn %= words_history_limit
			if(whn == last){
				break
			}
		}
	}
	
	var en:boolean = await storageGet('enabled')
	if(en == undefined){
		en = true
	}
	extensionEnable(en, false)
	if(en){
		search_words_obj.focus()
		return
	}
}
