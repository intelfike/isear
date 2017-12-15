browser.tabs.onActivated.addListener(async function(){
	await executeFile('inject.js')
	var swords = await storageGetWords()
	await storageSetWords(swords)
})

browser.tabs.onUpdated.addListener(async function(tabId:number, changeInfo, tab){
	var f = async ()=>{
		var flag = await executeCode('if(typeof itel_inject_flag != "undefined"){true}else{false}')
		if(flag != undefined) {
			if(flag[0] == true){
				return
			}
		}

		await executeCode('var itel_inject_flag = true')
		await executeFile('inject.js')
		browser.tabs.insertCSS(null, {
			code: '#itel-selected, #isear-top-selected{background-color:red !important; color:white !important;}\n' +
			'#isear-top-selected{border-color:white !important; z-index:9999999998 !important;}'
		})

		await saveGoogleSearchWords(tabId, tab.url)
		await highlighting(tabId)
	}
	if(changeInfo.status == 'complete'){
		f()
		return
	}
	whereTimeout(f, 200)
})
browser.tabs.onRemoved.addListener(async function(tabId:number){
	storageRemove(saveWordsPrefix+tabId)
	storageRemove(saveNumPrefix+tabId)
})

// google検索ワードをストレージに保存する
function saveGoogleSearchWords(tabId, url){
	return new Promise(async ok => {
		var gw = await storageGet('google_words', true, true)
		if(!gw){
			ok()
			return
		}
		if(url.indexOf('www.google') == -1){
			ok()
			return
		}
		if(!/[?&]q=/g.test(url)){
			ok()
			return
		}
		var q:string = url.match(/q=[^&]+/g)[0]
		q = q.substr(2)
		q = decodeURIComponent(q)

		var swords = q.split('+').join(' ')
		await storageSetWords(swords)
		ok()
	})
}
async function highlighting(tabId:number){
	var swords:string = await storageGetWords()
	var words_nums = await executeHighlightAuto(swords)
	await storageSet(saveNumPrefix+tabId, words_nums)
}

browser.runtime.onInstalled.addListener(()=>{
	browser.contextMenus.create({
		title: 'isear 検索ワードに追加',
		type: "normal",
		id: 'select',
		contexts: ['selection']
	 })
	 browser.contextMenus.create({
		 title: 'ハイライトのON/OFFを切り替える',
		 type: "normal",
		 id: 'toggle_highlight',
		 contexts: ['page']
	 })
	browser.contextMenus.create({
		title: 'ハイライトバー(右側)のON/OFFを切り替える',
		type: "normal",
		id: 'toggle_bars',
		contexts: ['page']
	 })
});

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
		var words_nums = await executeHighlightAuto(swords)
		await storageSetNum(words_nums)
		break
	case 'toggle_bars':
		var sb = await executeCode('showBars')
		sb = !sb[0]
		await executeCode('showBars = ' + sb)
		var swords:string = await storageGetWords()
		var words:Words = new Words(swords)
		await executeCode('toggleBars('+words.array.length+')')
		await storageSet('show_bar', sb, true)
		break
	case 'toggle_highlight':
		var bool:boolean = await storageGet('enabled', true)
		bool = !bool
		await storageSet('enabled', bool)
		var swords:string = await storageGetWords()
		await executeHighlight(swords, bool)

	}
});
