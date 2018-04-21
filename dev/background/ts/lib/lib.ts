function clear_words(){
	return new Promise(async (ok)=>{
		await storageSetWords('')
		await executeHighlightAuto('')
		ok()
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
		ok()
	})
}
