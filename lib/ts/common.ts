const regPrefix = '@RE:'
function trimReg(word){
		let regbool = false
		if(word.toUpperCase().indexOf(regPrefix) == 0){
			word = word.substr(regPrefix.length)
			regbool = true
		}
		return {word:word,regbool:regbool}
}


function wordsSplit(swords: string): string[]{
	swords = swords.trim()
	if(swords == ''){
		return []
	}
	var unique: {[key: string]: boolean;} = {}
	var words: string[] = swords.match(/-?"[^"]*"|-?'[^']+'|[^\s\t　]+/g)
	var result: string[] = []
	var regbool: boolean = false
	for(let n = 0; n < words.length; n++){
		let word = words[n]
		// 文字の重複を無くす
		if(unique[word] == true){
			continue
		}
		unique[word] = true
		
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
		}else{
			// カッコは検索しない
			word = word.replace(/[()]/g,'')
			word = word.replace(/^['"](.*)['"]$/g,'$1')
		}
		if(word == ''){
			continue
		}
		result.push(word)
	}
	return result
}

// 検索結果のハイライトの色の表示順
var colors = ['#FF0', '#4FF', '#F8F', '#8F8', '#FA0']
// wordsはwordSplitせよ
function executeHighlightAuto(words){
	return new Promise(async ok=>{
		var enabled = await storageGet('enabled')
		var enb = enabled['enabled']
		if(enb == undefined){
			enb = true
		}
		await executeHighlight(words, enb)
		ok()
	})
}
// boolはfalseならハイライトをオフ
function executeHighlight(words, bool=true){
	return new Promise(async ok=>{
		await executeCode("enabled="+JSON.stringify(bool))
		await executeCode("search_words="+JSON.stringify(words))
		await executeCode("colors="+JSON.stringify(colors))
		await executeCode("regPrefix="+JSON.stringify(regPrefix))
		var result = await executeFile('inject.js')
		chrome.tabs.insertCSS(null, {
			code: '#itel-selected{background-color:red !important;}'
		})
		ok(result)
	})
}

// 一定時間呼ばれなければ実行する
// キーボードイベントで一定時間操作しなければ実行 など
var timeouter
function whereTimeout(f, time){
	clearTimeout(timeouter)
	timeouter = setTimeout(f, time)
}

// 特定の長さになるまで左側を埋める
function leftfill(str, char, len){
	while(str.length < len){
		str = char + str
	}
	return str
}

