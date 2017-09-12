var search_words_obj = document.getElementById('search_words')
var btn_list_obj = document.getElementById('btn_list')
// 検索結果のハイライトの色の表示順
var colors = ['#FF0', '#5FF', '#F8F', '#8F8', '#FA0']


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
	if(e.key == 'Backspace' || e.key.length == 1){
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
function log(mess){
	inject("console.log('"+JSON.stringify(mess)+"')")
}


function getWords(){
	var search_words = search_words_obj.value
	search_words = search_words.trim()
	if(search_words == ''){
		return []
	}
	var words = search_words.match(/"[^"]*"|'[^']+'|[^\s]+/g)
	var result = []
	for(let n = 0; n < words.length; n++){
		let word = words[n].replace(/^['"]|['"]$/g,'')
		if(word == ''){
			continue
		}
		result.push(word)
	}
	return result
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
function updateButton(words){
	btn_list_obj.innerHTML = ''
	for(let n = 0; n < words.length; n++){
		let word = words[n]
		let btn = document.createElement('button')
		btn.innerText = word
		btn.id = word
		btn.style.backgroundColor = colors[n%colors.length]
		btn.addEventListener('click', function(){
			inject('scrollFocusNextWord("'+word+'", "itel-highlight", "itel-selected")')
		})
		btn_list_obj.append(btn)
	}
}

// 最初に実行される
document.addEventListener('DOMContentLoaded', function () {
	search_words_obj.addEventListener('keydown', keydown)
	search_words_obj.addEventListener('keyup', keyup)
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
	

	// btn.addEventListener('click', click)
	// var divs = document.querySelectorAll('button')
	// for (var i = 0; i < divs.length; i++) {
	// 	divs[i].addEventListener('click', click)
	// }
})
