var regPrefix = '@RE:'

function wordsSplit(search_words){
	search_words = search_words.trim()
	if(search_words == ''){
		return []
	}
	var words = search_words.match(/-?"[^"]*"|-?'[^']+'|[^\s\t　]+/g)
	var result = []
	var regbool = false
	for(let n = 0; n < words.length; n++){
		let word = words[n]
		if(word.toUpperCase() == regPrefix){
			regbool = true
			continue
		}
		if(word == 'OR'){
			continue
		}
		if(word.indexOf('-') == 0){
			continue
		}
		word = word.replace(/^['"(]|['")]$/g,'')
		if(word == ''){
			continue
		}
		if(regbool && word.indexOf(regPrefix) != 0){
			word = regPrefix+word
		}
		// コンパイル失敗した正規表現は削除
		if(word.toUpperCase().indexOf(regPrefix) == 0){
			try{
				new RegExp(word, 'g')
			}catch(e){
				continue
			}
		}
		result.push(word)
	}
	return result
}

// 検索結果のハイライトの色の表示順
var colors = ['#FF0', '#4FF', '#F8F', '#8F8', '#FA0']
// wordsはwordSplitせよ
function executeHighlight(words){
	return new Promise(async ok=>{
		var enabled = await storageGet('enabled')
		await executeCode("enabled="+JSON.stringify(enabled['enabled']))
		await executeCode("search_words="+JSON.stringify(words))
		await executeCode("colors="+JSON.stringify(colors))
		await executeCode("regPrefix="+JSON.stringify(regPrefix))
		await executeFile('inj.js')
		chrome.tabs.insertCSS(null, {
			code: '#itel-selected{background-color:red !important;}'
		})
		ok()
	})
}