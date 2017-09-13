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