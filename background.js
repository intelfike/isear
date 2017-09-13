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
	return new Promise(async ok => {
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
		await storageSet(url, words)
		await storageSet('value', words)
		ok()
	})
}
async function highlighting(url){
	var words = null
	var registedURL = false
	
	
	var value = await storageGet(url)
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
	if(registedURL){
		return
	}
	
	
	// もしURLに登録がなければ直前の値を取得
	value = await storageGet('value')
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
}


chrome.contextMenus.create({
	'title':'isear 検索ワードとして追加',
	'contexts':['selection'],
	'onclick':(clicked)=>{
		var text = clicked.selectionText
		alert(text + ':この機能はまだ未実装です(*^_^*)/')
	}
})
