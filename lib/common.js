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

// 検索結果のハイライトの色の表示順
var colors = ['#FF0', '#5FF', '#F8F', '#8F8', '#FA0']
// wordsはwordSplitせよ
function executeHighlight(words){
	return new Promise(async ok=>{
		var enabled = await storageGet('enabled')
		await executeCode("search_words="+JSON.stringify(words))
		await executeCode("colors="+JSON.stringify(colors))
		await executeCode("enabled="+JSON.stringify(enabled['enabled']))
		await executeFile('inj.js')
	})
}