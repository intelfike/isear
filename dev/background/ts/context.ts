browser.contextMenus.create({
	title: 'isear 検索ワードに追加',
	type: "normal",
	id: 'select',
	contexts: ['selection']
})
browser.contextMenus.create({
	title: ctx_title['toggle_hl']['true'],
	type: "normal",
	id: 'toggle_hl',
	contexts: ['browser_action']
})
browser.contextMenus.create({
	title: ctx_title['toggle_bars']['true'],
	type: "normal",
	id: 'toggle_bars',
	contexts: ['browser_action']
})
browser.contextMenus.create({
	title: ctx_title['clear']['true'],
	type: "normal",
	id: 'clear',
	contexts: ['browser_action']
})
browser.contextMenus.create({
	title: ctx_title['hl_blacklist']['true'],
	type: "normal",
	id: 'hl_blacklist',
	contexts: ['browser_action']
})
browser.contextMenus.create({
	title: ctx_title['hlbar_blacklist']['true'],
	type: "normal",
	id: 'hlbar_blacklist',
	contexts: ['browser_action']
})

browser.contextMenus.onClicked.addListener(async function(itemData) {
	var title = ''
	switch(itemData.menuItemId){
	case 'select':
		var text:string = itemData.selectionText
		if(/[\s\t　]/g.test(text)){
			text = text.replace(/[\s\t　]+/g, ' ')
			text = '"'+text+'"'
		}
		var swords:string = await storageGetWords()
		swords = swords + ' ' + text
		await storageSetWords(swords)
		await executeHighlightAuto(swords)
		break
	case 'toggle_hl':
		var enabled = await toggleEnable()
		title = ctx_title['toggle_hl'][''+enabled]
		break
	case 'toggle_bars':
		var sb = toggle_bars()
		title = ctx_title['toggle_bars'][''+sb]
		break
	case 'clear':
		await clear_words()
		break
	case 'hl_blacklist':
		var list = await storageGet('hl_blacklist', {}, true)
		var site = await getSite()
		if(list.hasOwnProperty(site)){
			list[site] = !list[site]
		}else{
			list[site] = false
		}
		await storageSet('hl_blacklist', list, true)
		var swords:string = await storageGetWords()
		await executeHighlightAuto(swords)
		title = ctx_title['hl_blacklist'][''+list[site]]
		break
	case 'hlbar_blacklist':
		var list = await storageGet('hlbar_blacklist', {}, true)
		var site = await getSite()
		if(list.hasOwnProperty(site)){
			list[site] = !list[site]
		}else{
			list[site] = false
		}
		await storageSet('hlbar_blacklist', list, true)
		var swords:string = await storageGetWords()
		var words:Words = new Words(swords)
		await executeCode('barsVisible('+words.array.length+', '+list[site]+')')
		title = ctx_title['hlbar_blacklist'][''+list[site]]
		break
	}
	if(title != ''){
		chrome.contextMenus.update(itemData.menuItemId, {
			title: title,
		})
	}
});
