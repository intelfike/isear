browser.contextMenus.create({
	title: 'isear 検索ワードに追加',
	type: "normal",
	id: 'select',
	contexts: ['selection']
})
browser.contextMenus.create({
	title: 'ハイライトをOFFにする',
	type: "normal",
	id: 'toggle_highlight',
	contexts: ['browser_action']
})
browser.contextMenus.create({
	title: 'ハイライトバーをOFFにする',
	type: "normal",
	id: 'toggle_bars',
	contexts: ['browser_action']
})
browser.contextMenus.create({
	title: '検索ワードをクリア',
	type: "normal",
	id: 'clear',
	contexts: ['browser_action']
})
browser.contextMenus.create({
	title: 'このサイトではハイライトしない',
	type: "normal",
	id: 'hl-blacklist',
	contexts: ['browser_action']
})
browser.contextMenus.create({
	title: 'このサイトではハイライトバーを表示しない',
	type: "normal",
	id: 'hlbar-blacklist',
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
	case 'toggle_highlight':
		var enabled = await toggleEnable()
		var title = "ハイライトをOFFにする"			
		if (!enabled) {
			title = "ハイライトをONにする"
		}
		break
		case 'toggle_bars':
		var sb = toggle_bars()
		var title = "ハイライトバーをOFFにする"			
		if (!sb) {
			title = "ハイライトバーをONにする"
		}
		break
	case 'clear':
		await clear_words()
		break
	case 'hl-blacklist':
		var list = await storageGet('hl-blacklist', {}, true)
		var site = await getSite()
		if(list.hasOwnProperty(site)){
			list[site] = !list[site]
		}else{
			list[site] = false
		}
		await storageSet('hl-blacklist', list, true)
		var swords:string = await storageGetWords()
		await executeHighlightAuto(swords)
		break
	case 'hlbar-blacklist':
		var list = await storageGet('hlbar-blacklist', {}, true)
		var site = await getSite()
		if(list.hasOwnProperty(site)){
			list[site] = !list[site]
		}else{
			list[site] = false
		}
		await storageSet('hlbar-blacklist', list, true)
		var swords:string = await storageGetWords()
		var words:Words = new Words(swords)
		await executeCode('barsVisible('+words.array.length+', '+list[site]+')')
		break
	}
	if(title != ''){
		chrome.contextMenus.update(itemData.menuItemId, {
			title: title,
		})
	}
});
