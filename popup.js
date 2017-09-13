var enabled_obj = document.getElementById('enabled')
enabled_obj.onchange = async ()=>{
	
	log(enabled_obj.checked)
}

// 検索結果のハイライトの色の表示順
var colors = ['#FF0', '#5FF', '#F8F', '#8F8', '#FA0']


var search_words_obj = document.getElementById('search_words')
search_words_obj.onkeydown = (e)=>{
	switch(e.code){
	case 'Enter':
		if(e.ctrlKey){
			// google検索結果に遷移
			var words = getWords()
			googleSearch(words)
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

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo){
	if (changeInfo.status !== 'complete'){
		return
	}

	updateAll()
})
function googleSearch(words){
	changeURL('https://www.google.com/search?q='+words.join('+'))
}

function getWords(){
	var search_words = search_words_obj.value
	return wordsSplit(search_words)
}


// 頻繁な更新対策
var timeouter
function updateAllTimeout(time){
	clearTimeout(timeouter)
	timeouter = setTimeout(function(){
		updateAll()
	}, time)
}

function updateAll(){
	// クリックしてワードを辿るためのボタンを表示
	var words = getWords()
	updateButton(words)

	// ページにデータを送る
	inject("search_words="+JSON.stringify(words))
	inject("colors="+JSON.stringify(colors))
	// ページ内検索結果を表示するためのスクリプトを注入！
	chrome.tabs.executeScript(null,
		{file:"inj.js"}
	)

	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		if(tabs.length == 0){
			return
		}
		var url = tabs[0].url;
		var data = {}
		data[url] = search_words_obj.value
		chrome.storage.local.set(data)
	});
	chrome.storage.local.set({'value':search_words_obj.value})
	
	chrome.tabs.insertCSS(null, {
		code: '#itel-selected{background-color:red !important;}'
	})
}

// 引数は文字列型配列
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
document.body.onload = ()=>{
	search_words_obj.focus()
	
	var registedURL = false
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		var url = tabs[0].url;
		chrome.storage.local.get(url, function(value){
			if(value[url] == undefined){
				return
			}
			registedURL = true
			search_words_obj.value = value[url]
			updateAllTimeout()
		})
	});
	if(registedURL){
		return
	}
	chrome.storage.local.get('value', function(value){
		if(value.value == undefined){
			return
		}
		search_words_obj.value = value.value
		updateAllTimeout()
	})
}
// document.addEventListener('DOMContentLoaded', function () {

	

// 	// btn.addEventListener('click', click)
// 	// var divs = document.querySelectorAll('button')
// 	// for (var i = 0; i < divs.length; i++) {
// 	// 	divs[i].addEventListener('click', click)
// 	// }
// })
