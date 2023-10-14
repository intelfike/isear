function clear_words(){
	return new Promise(async (ok)=>{
		await storageSetWords('')
		await executeHighlightAuto('')
		ok(null)
	})
}
function toggle_bars():Promise<boolean>{
	return new Promise(async (ok)=>{
		var sb = await executeCode('showBars')
		sb = !sb[0]
		await executeCode('showBars = ' + sb)
		var swords:string = await storageGetWords()
		var words:Words = new Words(swords)
		await executeCode('barsVisible('+words.array.length+', '+sb+')')
		await storageSet('show_bar', sb, true)
		ok(sb)
	})
}
function retry(){
	return new Promise(async (ok)=>{
		ok(null)
	})
}

// ブラックリスト入りかどうか(ハイライト)
// falseならブラックリスト入り
function hlGetSiteMode():Promise<boolean>{
	return new Promise(async ok => {
		var list:{[key:string]:boolean;} = await storageGet('hl_blacklist', {}, true)
		var site = await getSite()
		if(list.hasOwnProperty(site)){
			ok(list[site])
		}else{
			ok(true)
		}
	})
}
// ブラックリスト入りかどうか(ハイライトバー)
// falseならブラックリスト入り
function hlbarGetSiteMode():Promise<boolean>{
	return new Promise(async ok => {
		var list:{[key:string]:boolean;} = await storageGet('hlbar_blacklist', {}, true)
		var site = await getSite()
		if(list.hasOwnProperty(site)){
			ok(list[site])
		}else{
			ok(true)
		}
	})
}