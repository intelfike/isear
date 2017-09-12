var search_words_obj = document.getElementById('search_words')
// 検索結果のハイライトの色の表示順
var colors = ['#FF0', '#5FF', '#F8F', '#8F8', '#FA0']


chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab){
	if(changeInfo.status != 'complete'){
		return
	}
	await saveGoogleSearchWords(tab.url)
	highlighting(tab.url)
})

function saveGoogleSearchWords(url){
	return new Promise(ok => {
		if(url.indexOf('www.google') == -1){
			ok()
			return
		}
		if(!/[?&]q=/g.test(url)){
			ok()
			return
		}
		q = url.match(/q=[^&]+/g)[0]
		q = q.substr(2)
		q = decodeURI(q)
		words = q.split('+').join(' ')
		var data = {}
		data[url] = words
		chrome.storage.local.set(data, ()=>{
			chrome.storage.local.set({'value':words}, ()=>{
				ok()
			})
		})
	})
}
function highlighting(url){
	var words = null
	var registedURL = false
	chrome.storage.local.get(url, function(value){
		if(value[url] == undefined){
			return
		}
		registedURL = true
		words = wordsSplit(value[url])
		// ページにデータを送る
		inject("search_words="+JSON.stringify(words))
		inject("colors="+JSON.stringify(colors))
		// ページ内検索結果を表示するためのスクリプトを注入！
		chrome.tabs.executeScript(null,
			{file:"inj.js"}
		)
	})
	if(registedURL){
		return
	}
	chrome.storage.local.get('value', function(value){
		if(value.value == undefined){
			return
		}
		words = wordsSplit(value.value)
		// ページにデータを送る
		inject("search_words="+JSON.stringify(words))
		inject("colors="+JSON.stringify(colors))
		// ページ内検索結果を表示するためのスクリプトを注入！
		chrome.tabs.executeScript(null,
			{file:"inj.js"}
		)
	})
}
function wordsSplit(search_words){
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
function inject(code){
	chrome.tabs.executeScript(null,
		{code:code}
	)
}
