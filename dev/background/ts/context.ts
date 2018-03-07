browser.contextMenus.create({
	title: 'isear 検索ワードに追加',
	type: "normal",
	id: 'select',
	contexts: ['selection']
})
browser.contextMenus.create({
	title: 'ハイライトの表示切り替え',
	type: "normal",
	id: 'toggle_highlight',
	contexts: ['browser_action']
})
browser.contextMenus.create({
	title: 'ハイライトバーの表示切り替え',
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

browser.contextMenus.onClicked.addListener(async function(itemData) {
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
		toggleEnable()
		break
	case 'toggle_bars':
		toggle_bars()
		break
	case 'clear':
		await clear_words()
		break
	}
});
