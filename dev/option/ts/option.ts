const lang_data = {
	'title' : {
		en : 'isear Settings',
		ja : 'isearの設定',
	},
	'color' : {
		title : {
			en : 'Color Settings',
			ja : '色の設定',
		},
		detail : {
			en : 'Color seggings for HighLights. Useful Drag & Drop(chrome)',
			ja : 'ハイライトで利用される色を設定します。',
		},
		normal : {
			en : 'normal',
			ja : '標準',
		},
		pastel : {
			en : 'pastel',
			ja : 'パステル',
		},
		dark : {
			en : 'dark',
			ja : 'ダーク',
		},
		custom : {
			en : 'custom',
			ja : 'カスタム',
		},
		button : {
			en : 'exchanging checked color',
			ja : 'チェックを入れた２つを入れ替える',
		},
	},
	'logs' : {
		title : {
			en : 'Logs Settings',
			ja : '履歴の設定',
		},
		detail : {			
			en : 'You press [↑][↓] key with searching box when it display Search Word history.',
			ja : '検索ワード履歴を表示するときは、検索ボックスで[↑] [↓]キーを押します。',
		},
		enable : {			
			en : 'Enable logging Search Words.',
			ja : '検索ワードの記録を有効にする',
		},
		clear : {
			en : 'clear logs',
			ja : '履歴をすべて削除する',
		},
	},
	'detail' : {
		title : {
			en : 'Settings',
			ja : '詳細設定',
		},
		detail : {
			en : 'Extensnions Moving Setting',
			ja : '拡張機能の挙動を設定します。',
		},
		enabled_sync : {
			en : 'Enable synchronous settings for multiple browser with a account.',
			ja : '同一アカウント内で設定を共有する(同じアカウントであれば、異なるPCでも設定が共有されます)',
		},
		google_words : {
			en : 'Enable getting Google Search words',
			ja : 'Googleの検索ワードを自動取得する',
		},
		auto_update : {
			en : 'Enable automatically update highlight.(testing)',
			ja : 'ページコンテンツの更新時にハイライトを自動更新する(試験的)',
		},
		command_mode : {
			en : 'Enable command mode. [Alt+M] ',
			ja : 'コマンドモードを利用する [Alt+M]',
		},
		regbool : {
			en : 'Enable RegExp. "@RE:" ',
			ja : '正規表現検索をする "@RE:"',
		},
		enabled_bar : {
			en : 'Enable displaying HighLight Bar.',
			ja : 'ハイライトバーを有効にする',
		},
		popup_highlight : {
			en : 'Only enable high light when it`s opening popup.',
			ja : 'ポップアップが開いているときのみハイライトを有効にする',
		},
		link : {
			en : 'detail',
			ja : '詳細',
		},
	},
	'template' : {
		title : {
			en : 'Template',
			ja : '定型文',
		},
		detail : {
			en : 'You can register frequently used words.',
			ja : 'よく使う単語を登録できます。',
		}
	},
	'template_type' : {
		always : {
			en : 'Google searching word prefix. For example regist NG word.',
			ja : '常に検索ワードの先頭にくっつきます。NGワードの登録などにご利用ください。',
		},
		add : {
			en : 'If click [+] button on popup then it add "Template for addition" to search word.',
			ja : 'ポップアップ上の[+]ボタンをクリックすると、検索ワードボックスに追可用定型文が追加されます。',
		},
	},
	'blacklist' : {
		title : {
			en : 'Black List',
			ja : 'ブラックリスト',
		},
		detail : {
			en : 'If settings Black List then some site are not highlight.',
			ja : 'ブラックリストを設定することによって、一部のサイトをハイライトの対象外にすることができます。',
		},
		link : {
			en : 'Settings',
			ja : '設定',
		},
	},
	'support' : {
		title : {
			en : 'Please support development money',
			ja : '支援',
		},
		detail : {
			en : 'Please give me support for better provide service.',
			ja : 'より良いサービス提供のため、ご支援よろしくお願いします',
		},
		link : {
			en : 'Here',
			ja : 'ここから',
		}
	},
}
for (let key1 in lang_data) {
	let value = lang_data[key1]
	if (typeof value.ja != 'undefined') {
		lang_set(key1 , value)
		continue
	}
	for (let key2 in value) {
		let data = value[key2]
		lang_set(key1 + '-' + key2 , data)
	}
}

// 設定の管理
const logs_clear = <HTMLInputElement> document.getElementById('logs_clear')
logs_clear.onclick = () => {
	clearLogs()
}

const enabled_log = <HTMLInputElement> document.getElementById('enabled_log')
enabled_log.onchange = () => {
	var enable = enabled_log.checked
	storageSet('words_logs_enabled', enable, true)
}

const enabled_sync = <HTMLInputElement> document.getElementById('enabled_sync')
enabled_sync.onchange = async () => {
	var enable = enabled_sync.checked
	await storageSet('sync', enable)
	location.reload()
}

const google_words = <HTMLInputElement> document.getElementById('google_words')
google_words.onchange = () => {
	var enable = google_words.checked
	storageSet('google_words', enable, true)
}

const auto_update = <HTMLInputElement> document.getElementById('auto_update')
auto_update.onchange = () => {
	var enable = auto_update.checked
	storageSet('auto_update', enable, true)
}

const command_mode = <HTMLInputElement> document.getElementById('command_mode')
command_mode.onchange = () => {
	var enable = command_mode.checked
	storageSet('command_mode', enable, true)
}

const regbool = <HTMLInputElement> document.getElementById('regbool')
regbool.onchange = () => {
	var enable = regbool.checked
	storageSet('regbool', enable, true)
}

const enabled_bar = <HTMLInputElement> document.getElementById('enabled_bar')
enabled_bar.onchange = () => {
	var enable = enabled_bar.checked
	storageSet('enabled_bar', enable, true)
}

const popup_highlight = <HTMLInputElement> document.getElementById('popup_highlight')
popup_highlight.onchange = () => {
	var enable = popup_highlight.checked
	storageSet('popup_highlight', enable, true)
}

// prefix は、あとにつける場合もある
// あとからaddを追加するため
const prefix = <HTMLInputElement> document.getElementById('prefix')
prefix.onchange = () => {
	var pf = prefix.value
	storageSet('prefix', pf, true)
}
prefix.onkeydown = prefix.onchange

var template_type = document.getElementsByName('template-type')
for (let key in template_type) {
	let ttobj = <HTMLInputElement> template_type[key]
	ttobj.onchange = () => {
		var tt = ttobj.value
		storageSet('template-type', tt, true)
	}	
}

const exchange = <HTMLInputElement> document.getElementById('exchange')
exchange.onclick = () => {
	var tmp = first.col.value
	first.col.value = second.col.value
	second.col.value = tmp
	first.col.onchange(null)
	second.col.onchange(null)
}
var first:{[key:string]:HTMLInputElement}
var second:{[key:string]:HTMLInputElement}

document.body.onload = async () => {
	var sync = await storageGet('sync', false)
	enabled_sync.checked = sync

	var gw = await storageGet('google_words', true, true)
	google_words.checked = gw

	var au = await storageGet('auto_update', false, true)
	auto_update.checked = au

	var rb = await storageGet('command_mode', false, true)
	command_mode.checked = rb

	var rb = await storageGet('regbool', false, true)
	regbool.checked = rb

	var sb = await storageGet('enabled_bar', true, true)
	enabled_bar.checked = sb

	var sb = await storageGet('popup_highlight', false, true)
	popup_highlight.checked = sb

	var sb = await storageGet('words_logs_enabled', false, true)
	enabled_log.checked = sb

	var pf = await storageGet('prefix', '', true)
	prefix.value = pf

	var tt = await storageGet('template-type', 'add', true)
	for (let key in template_type) {
		let ttobj = <HTMLInputElement> template_type[key]
		if (ttobj.value == tt) {
			ttobj.checked = true
		}
	}

	// 色の設定
	bgColors = await storageGet('bgColors', bgColors, true)

	let colset = <HTMLInputElement>document.getElementById("color-select")
	colset.value = await storageGet('color-set', 'normal', true)
	colset.onchange = async e => {
		const cols = document.getElementById('colors')
		cols.innerText = ''
		let sets = {
			'normal' : ['#FFFF00', '#88FF88', '#00FFFF', '#CCDDFF', '#FF88FF', '#FF8888', '#FFAA00'],
			'pastel' : ['#F0D0E4', '#F9DFD5', '#FEF7D5', '#F8FAD4', '#C8EFEA', '#CBE6F3', '#E5D7EE'],
			'dark' : ['#F9DB57', '#E4EC5B', '#40BFB0', '#45A1CF', '#9D73BB', '#C35B9D', '#E6855E'],
		}
		let set = sets[colset.value]
		if (colset.value == 'custom') {
			set = await storageGet('bgColors', bgColors, true)
			editableColors(set, true)
		} else {
			editableColors(set, false)
		}

		let colors = document.getElementsByClassName('colors')
		for (let i in colors) {
			let col = <HTMLInputElement>colors[i]
			col.value = set[i]
		}
		storageSet('color-set', colset.value, true)
	}
	colset.onchange(null)
}

async function editableColors(bgColors, enable) {
	const cols = document.getElementById('colors')
	// 色の初期化
	var start
	for (let i = 0; i < bgColors.length; i++) {
		// 選択用のチェックボックスを定義
		let container = document.createElement('div')

		let selector = <HTMLInputElement>document.createElement('input')
		if (enable) {
			container.appendChild(selector)
		}

		let color = bgColors[i]
		let col = <HTMLInputElement>document.createElement('input')
		col.type = 'color'
		col.className = 'colors'
		col.id = 'color' + i
		col.value = color
		col.disabled = !enable
		container.appendChild(col)

		// カラーピッカーのイベント設定
		col.onchange = ()=>{
			bgColors[i] = col.value
			storageSet('bgColors', bgColors, true)
		}

		// ドラッグ＆ドロップで移動
		col.draggable = true
		col.ondragstart = (e)=>{
			start = col
		}
		col.ondrop = (e)=>{
			if(start == col){
				return
			}
			var tmp = start.value
			start.value = col.value
			col.value = tmp
			start.onchange(null)
			col.onchange(null)
			start = undefined
		}

		col.ondragover = (e)=>{e.preventDefault()}
		col.ondragenter = (e)=>{e.preventDefault()}
		cols.appendChild(container)
		if (enable) {
			selector.type = "checkbox"
			selector.id = 'selector' + i
			selector.className = 'selector'
			// first secondを設定
			if(second == undefined){
				if(first == undefined){
					first = {col:col, sel:selector}
					selector.checked = true
				} else {
					second = {col:col, sel:selector}
					selector.checked = true
				}
			}
			// セレクタ
			selector.onclick = (e) => {
				if(!selector.checked){
					e.preventDefault()
					return false
				}
			}
			selector.onchange = (e) => {
				first.sel.checked = false
				first = second
				second = {col:col, sel:selector}
			}
		}
	}
	if (enable) {
		exchange.style.display = 'block'
	} else {
		exchange.style.display = 'none'
	}
}