// swordは原文を渡す
function executeHighlightAuto(swords:string):Promise<{[key:string]:number;}>{
	return new Promise(async ok=>{
		var enb:boolean = await storageGet('enabled')
		if(enb == undefined){
			enb = true
		}
		var result:{[key:string]:number;} = await executeHighlight(swords, enb)
		ok(result)
	})
}
// boolはfalseならハイライトをオフ
function executeHighlight(swords:string, bool=true):Promise<{[key:string]:number;}>{
	return new Promise(async ok=>{
		await executeCode("enabled="+JSON.stringify(bool))
		await executeCode("search_words="+JSON.stringify(swords))
		var result = await executeCode('itel_main()')
		ok(<Promise<{[key:string]:number;}>> result[0])
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

