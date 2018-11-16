async function setContext() {
	var STRING = getSTRING()
	var STRINGBG = STRING['background']
	console.log(STRING)
	browser.contextMenus.create({
		title: STRINGBG['PICKUP_WORD'],
		type: "normal",
		id: 'select',
		contexts: ['selection']
	})
	browser.contextMenus.create({
		title: STRINGBG['TOGGLE_HIGHLIGHT']['true'],
		type: "normal",
		id: 'toggle_hl',
		contexts: ['browser_action']
	})
	browser.contextMenus.create({
		title: STRINGBG['TOGGLE_HIGHLIGHT_BAR']['true'],
		type: "normal",
		id: 'toggle_bars',
		contexts: ['browser_action']
	})
	browser.contextMenus.create({
		title: STRINGBG['CLEAR_WORDS']['true'],
		type: "normal",
		id: 'clear',
		contexts: ['browser_action']
	})
	browser.contextMenus.create({
		title: STRINGBG['TOGGLE_HIGHLIGHT_HERE']['true'],
		type: "normal",
		id: 'hl_blacklist',
		contexts: ['browser_action']
	})
	browser.contextMenus.create({
		title: STRINGBG['TOGGLE_HIGHLIGHT_BAR_HERE']['true'],
		type: "normal",
		id: 'hlbar_blacklist',
		contexts: ['browser_action']
	})
}

setContext()

browser.contextMenus.onClicked.addListener(async function(itemData) {
	var STRING = getSTRING()
	var STRINGBG = STRING['background']
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
		title = STRINGBG['TOGGLE_HIGHLIGHT'][''+enabled]
		break
	case 'toggle_bars':
		var sb = toggle_bars()
		title = STRINGBG['TOGGLE_HIGHLIGHT_BAR'][''+sb]
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
		title = STRINGBG['TOGGLE_HIGHLIGHT_HERE'][''+list[site]]
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
		title = STRINGBG['TOGGLE_HIGHLIGHT_BAR_HERE'][''+list[site]]
		break
	}
	if(title != ''){
		chrome.contextMenus.update(itemData.menuItemId, {
			title: title,
		})
	}
});
