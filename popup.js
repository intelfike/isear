var search_words_dom = document.getElementById('search_words')
var btn_list_dom = document.getElementById('btn_list')

function keydown(e){
	if(e.code != 'Enter'){
		return
	}

	// google検索結果に遷移
	var words = getWords()

	chrome.tabs.onUpdated.addListener(function(){
		updateAll()
	})
	chrome.tabs.update(null, {
		url:'https://www.google.com/search?q='+words.join('+')
	})

	// chrome.storage.local.set({'value':words.join(' ')})
}

var timeouter
function keyup(){
	clearTimeout(timeouter)
	timeouter = setTimeout(function(){
		updateAll()
	}, 500)
}

function getWords(){
	var search_words = search_words_dom.value.replace(/'/g, '')
	search_words = search_words.trim(' 　')
	if(search_words == ''){
		return []
	}
	var words = search_words.split(/[\s　]+/g)
	return words
}

function updateAll(){
	// クリックしてワードを辿るためのボタンを表示
	var words = getWords()
	updateButton(words)

	// ページにデータを送る
	chrome.tabs.executeScript(null,
		{code:"search_words="+JSON.stringify(words)}
	)
	// ページ内検索結果を表示するためのスクリプトを注入！
	chrome.tabs.executeScript(null,
		{file:"inj.js"}
	)

	chrome.storage.local.set({'value':words.join(' ')})

}

// 引数は文字列型配列
function updateButton(words){
	var btnhtml = ''
	for(let n = 0; n < words.length; n++){
		let word = words[n]
		btnhtml += '<button>'+word+'</button>\n'
	}
	btn_list_dom.innerHTML = btnhtml
}

document.addEventListener('DOMContentLoaded', function () {
	search_words_dom.addEventListener('keydown', keydown)
	search_words_dom.addEventListener('keyup', keyup)
	search_words_dom.focus()

	chrome.storage.local.get('value', function(value){
		if(value.value == undefined){
			return
		}
		search_words_dom.value = value.value
		search_words_dom.focus()
		updateAll()
	})

	// btn.addEventListener('click', click)
	// var divs = document.querySelectorAll('button')
	// for (var i = 0; i < divs.length; i++) {
	// 	divs[i].addEventListener('click', click)
	// }
})

function message(value){
	chrome.tabs.executeScript(null,
		{code:"alert('"+value+"')"}
	)
}