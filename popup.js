var search_words_obj = document.getElementById('search_words')
var btn_list_obj = document.getElementById('btn_list')

function keydown(e){
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
function keyup(e){
	if(e.code == 'Enter'){
		return
	}
	updateAllTimeout(300)
}

chrome.tabs.onUpdated.addListener(function(){
	updateAllTimeout(500)
})
function googleSearch(words){
	changeURL('https://www.google.com/search?q='+words.join('+'))
}
function changeURL(url){
	chrome.tabs.update(null, {
		url:url
	})
}
function inject(code){
	chrome.tabs.executeScript(null,
		{code:code}
	)
}
function message(value){
	inject("alert('"+value+"')")
}


function getWords(){
	var search_words = search_words_obj.value.replace(/'/g, '')
	search_words = search_words.trim(' 　')
	if(search_words == ''){
		return []
	}
	var words = search_words.split(/[\s　]+/g)
	return words
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
	// ページ内検索結果を表示するためのスクリプトを注入！
	chrome.tabs.executeScript(null,
		{file:"inj.js"}
	)

	chrome.storage.local.set({'value':words.join(' ')})
	
	chrome.tabs.insertCSS(null, {
		code: '#itel-selected{background-color:red !important;}'
	})
}

// 引数は文字列型配列
function updateButton(words){
	var btnhtml = ''
	for(let n = 0; n < words.length; n++){
		let word = words[n]
		btnhtml += '<button>'+word+'</button>\n'
	}
	btn_list_obj.innerHTML = btnhtml
}

document.addEventListener('DOMContentLoaded', function () {
	search_words_obj.addEventListener('keydown', keydown)
	search_words_obj.addEventListener('keyup', keyup)
	search_words_obj.focus()

	chrome.storage.local.get('value', function(value){
		if(value.value == undefined){
			return
		}
		search_words_obj.value = value.value
		search_words_obj.focus()
		updateAllTimeout()
	})
	

	// btn.addEventListener('click', click)
	// var divs = document.querySelectorAll('button')
	// for (var i = 0; i < divs.length; i++) {
	// 	divs[i].addEventListener('click', click)
	// }
})
