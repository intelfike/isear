function trimReg(word){
	let regbool = false
	if(word.toUpperCase().indexOf(regPrefix) == 0){
		word = word.substr(regPrefix.length)
		regbool = true
	}
	return {word:word,regbool:regbool}
}


function wordsSplit(swords: string): string[]{
	var words = new Words(swords)
	var result:string[] = words.getList('origin')
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

